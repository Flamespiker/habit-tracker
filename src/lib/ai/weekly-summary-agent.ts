import { tool } from '@langchain/core/tools'
import { ChatAnthropic } from '@langchain/anthropic'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { HumanMessage } from '@langchain/core/messages'
import { z } from 'zod'

import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getCheckinsForPeriod } from '@/lib/db/supabase/checkins'
import { getCoachingHistory, saveCoachingResponse } from '@/lib/db/mongo/ai-coaching'
import type { IAiCoaching } from '@/lib/db/mongo/models/AiCoaching'

const MODEL_ID = 'claude-sonnet-4-6'

// ---------------------------------------------------------------------------
// Output type
// ---------------------------------------------------------------------------

/** Structured content saved to MongoDB as type: 'weekly_summary'. */
export interface WeeklySummaryContent {
  /** 2–3 sentence narrative of the week. */
  overview: string
  /** Notable wins or streaks. */
  highlights: string[]
  /** Areas where the user struggled. */
  struggles: string[]
  /** One actionable focus for the coming week. */
  recommendation: string
}

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

/**
 * Runs the LangGraph weekly summary agent for a given user.
 * Calls readHabitData and readCoachingHistory tools to gather context,
 * generates a structured WeeklySummaryContent, and saves it to MongoDB.
 *
 * Must be called from a server-side context (API route or Server Component)
 * because the Supabase query functions rely on next/headers cookies.
 */
export async function runWeeklySummaryAgent(userId: string): Promise<IAiCoaching> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // -------------------------------------------------------------------------
  // Tools — close over userId and date range so they need no input args
  // -------------------------------------------------------------------------

  const readHabitData = tool(
    async (): Promise<string> => {
      const [habitRows, checkins] = await Promise.all([
        getHabits(userId),
        getCheckinsForPeriod(userId, sevenDaysAgo, today),
      ])
      const habits = habitRows.map((row) => toHabit(row, checkins))
      // Return only the fields the LLM needs; strip large internal arrays
      const summary = habits.map((h) => ({
        id: h.id,
        name: h.name,
        category: h.category,
        streak: h.streak,
        completed_today: h.completed_today,
        // weekly_data: index 0 = 6 days ago, index 6 = today
        weekly_data: h.weekly_data,
      }))
      return JSON.stringify({ habits: summary, dateRange: { from: sevenDaysAgo, to: today } })
    },
    {
      name: 'readHabitData',
      description:
        "Fetches the user's habits and their check-in data for the past 7 days from Supabase. Returns habit names, categories, streaks, and daily completion arrays.",
      schema: z.object({}),
    }
  )

  const readCoachingHistory = tool(
    async (): Promise<string> => {
      // Up to 7 entries — roughly one daily nudge per day over the past week
      const entries = await getCoachingHistory(userId, 7)
      const relevant = entries.map((e) => ({
        type: e.type,
        content: e.content,
        created_at: e.created_at,
      }))
      return JSON.stringify(relevant)
    },
    {
      name: 'readCoachingHistory',
      description:
        "Fetches the past week's coaching nudges for the user from MongoDB. Provides context on recent encouragement and themes the coach has raised.",
      schema: z.object({}),
    }
  )

  // -------------------------------------------------------------------------
  // LLM + agent graph
  // -------------------------------------------------------------------------

  const llm = new ChatAnthropic({ model: MODEL_ID })

  const agent = createReactAgent({
    llm,
    tools: [readHabitData, readCoachingHistory],
    prompt: `You are a habit coaching assistant generating a weekly summary report.

Steps:
1. Call readHabitData to get the user's habits and check-ins for the past 7 days.
2. Call readCoachingHistory to get this week's coaching nudges.
3. Analyse the data and produce a JSON weekly summary with EXACTLY this shape:

{
  "overview": "<2–3 sentence narrative summarising the week>",
  "highlights": ["<achievement or streak>", "..."],
  "struggles": ["<area where completion was low or missing>", "..."],
  "recommendation": "<one specific, actionable focus for the coming week>"
}

Respond with ONLY the JSON object — no markdown fences, no extra commentary.`,
  })

  // -------------------------------------------------------------------------
  // Invoke
  // -------------------------------------------------------------------------

  const result = await agent.invoke({
    messages: [new HumanMessage('Generate my weekly habit summary.')],
  })

  // Extract the final assistant message
  const lastMessage = result.messages.at(-1)
  const rawContent =
    typeof lastMessage?.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage?.content)

  let summaryContent: WeeklySummaryContent
  try {
    summaryContent = JSON.parse(rawContent) as WeeklySummaryContent
  } catch {
    throw new Error(`Agent returned non-JSON content: ${rawContent}`)
  }

  // -------------------------------------------------------------------------
  // Persist to MongoDB
  // -------------------------------------------------------------------------

  return saveCoachingResponse({
    user_id: userId,
    type: 'weekly_summary',
    content: summaryContent,
    model: MODEL_ID,
    habit_context: { dateRange: { from: sevenDaysAgo, to: today } },
  })
}
