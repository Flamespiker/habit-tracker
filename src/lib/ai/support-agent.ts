import { tool } from '@langchain/core/tools'
import { ChatAnthropic } from '@langchain/anthropic'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { HumanMessage } from '@langchain/core/messages'
import { z } from 'zod'

import { getHabits, toHabit } from '@/lib/db/supabase/habits'
import { getCheckinsForPeriod } from '@/lib/db/supabase/checkins'
import { getCoachingHistory } from '@/lib/db/mongo/ai-coaching'

const MODEL_ID = 'claude-sonnet-4-6'

// ---------------------------------------------------------------------------
// Static help content
// ---------------------------------------------------------------------------

const HELP_CONTENT: Record<string, string> = {
  habits: `
Habits are recurring activities you want to track daily or on specific days of the week.
- Create a habit from the dashboard or /habits page using the "Add habit" button.
- Each habit has a name, category (health, fitness, mindfulness, productivity, learning), and target days per week.
- Toggle a habit complete on the dashboard or on the Daily Log (/log) page.
- Completing a habit counts toward your streak and weekly progress.
`.trim(),

  goals: `
Goals are outcomes you want to achieve, optionally linked to one or more habits.
- Create a goal from the /goals page.
- A goal has a title, optional description, target date, and status: active, completed, or abandoned.
- Link habits to a goal to track which habits support it.
- Goals with no linked habits are standalone goals.
`.trim(),

  checkins: `
A check-in records whether you completed a habit on a given day.
- Toggling the check button on a habit creates or updates a check-in for today (UTC date).
- Check-ins are stored in Supabase and used to compute streaks and weekly progress.
- If you accidentally mark a habit complete, toggle it again to unmark it.
- Check-ins on the Daily Log page (/log) are currently local only — use the dashboard to persist them.
`.trim(),

  streaks: `
A streak counts the number of consecutive days you completed a habit.
- Streaks count backward from today. If today is not yet complete, the count starts from yesterday so your streak isn't prematurely broken.
- Missing a day resets the streak to 0.
- The total streak shown on the dashboard is the sum of all individual habit streaks.
`.trim(),

  log: `
The Daily Log (/log) is where you review today's habits, add journal notes, and get a coaching nudge.
- Habit toggles on the log page are currently local state only (not persisted) — use the dashboard to record real check-ins.
- The "Log Day" button sends your habit status and notes to the AI coach and streams back a personalised nudge.
- The "Generate weekly summary" button runs the weekly summary agent and shows a structured report of the past 7 days.
- The coaching card at the top shows your most recent nudge or weekly summary.
`.trim(),

  coaching: `
Coaching nudges are short, personalised messages from the AI coach based on your habits and check-ins.
- A daily nudge is generated when you tap "Log Day" on the /log page or "Get nudge" on the dashboard.
- A weekly summary is generated when you tap "Generate weekly summary" on the /log page.
- All nudges and summaries are saved to your coaching history and accessible via GET /api/coaching.
- Your coaching style preference (motivational, analytical, gentle) can be changed in Settings.
`.trim(),

  settings: `
The Settings page lets you configure your coaching preferences and notification time.
- Coaching Style: choose motivational, analytical, or gentle — auto-saves on click.
- Notification Time: set a preferred time for reminders — saved on button click.
- Changes are stored in MongoDB and applied the next time a coaching nudge is generated.
`.trim(),
}

const HELP_TOPICS = Object.keys(HELP_CONTENT).join(', ')

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

/**
 * Runs the LangGraph support agent for a given user and question.
 * The agent can look up app help text, fetch the user's habits, and fetch
 * recent coaching history to answer the question with relevant context.
 * Returns a plain text answer string.
 *
 * Must be called from a server-side context (API route or Server Component)
 * because the Supabase query functions rely on next/headers cookies.
 */
export async function runSupportAgent(userId: string, question: string): Promise<string> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // -------------------------------------------------------------------------
  // Tools
  // -------------------------------------------------------------------------

  const getAppHelp = tool(
    async ({ topic }: { topic: string }): Promise<string> => {
      const normalised = topic.toLowerCase().trim()
      return HELP_CONTENT[normalised] ?? `No help found for topic "${topic}". Available topics: ${HELP_TOPICS}.`
    },
    {
      name: 'getAppHelp',
      description: `Returns help text for a specific app feature. Use this when the user asks how something works. Available topics: ${HELP_TOPICS}.`,
      schema: z.object({
        topic: z.string().describe(`The feature to look up. One of: ${HELP_TOPICS}.`),
      }),
    }
  )

  const getUserHabits = tool(
    async (): Promise<string> => {
      const [habitRows, checkins] = await Promise.all([
        getHabits(userId),
        getCheckinsForPeriod(userId, sevenDaysAgo, today),
      ])
      const habits = habitRows.map((row) => toHabit(row, checkins))
      const summary = habits.map((h) => ({
        name: h.name,
        category: h.category,
        streak: h.streak,
        completed_today: h.completed_today,
        weekly_data: h.weekly_data,
      }))
      return JSON.stringify({ habits: summary, dateRange: { from: sevenDaysAgo, to: today } })
    },
    {
      name: 'getUserHabits',
      description:
        "Fetches the user's current habits from Supabase including streak, today's completion status, and the past 7 days of check-in data. Use when the user asks about their habits or progress.",
      schema: z.object({}),
    }
  )

  const getRecentCoachingHistory = tool(
    async (): Promise<string> => {
      const entries = await getCoachingHistory(userId, 5)
      const relevant = entries.map((e) => ({
        type: e.type,
        content: e.content,
        created_at: e.created_at,
      }))
      return JSON.stringify(relevant)
    },
    {
      name: 'getCoachingHistory',
      description:
        "Fetches the user's 5 most recent coaching nudges and summaries from MongoDB. Use when the user asks about past coaching, their recent summaries, or what the coach has said.",
      schema: z.object({}),
    }
  )

  // -------------------------------------------------------------------------
  // LLM + agent graph
  // -------------------------------------------------------------------------

  const llm = new ChatAnthropic({ model: MODEL_ID })

  const agent = createReactAgent({
    llm,
    tools: [getAppHelp, getUserHabits, getRecentCoachingHistory],
    prompt: `You are a helpful support assistant for a personal habit and goal tracking app.
You have access to three tools:
- getAppHelp(topic): returns documentation for app features (habits, goals, check-ins, streaks, log, coaching, settings)
- getUserHabits: fetches the user's real habit data including streaks and recent completions
- getCoachingHistory: fetches the user's recent coaching nudges and weekly summaries

Use tools when they would help answer the question more accurately. You do not need to call all tools — only those relevant to the question.

Be concise and friendly. Answer in plain text with no markdown formatting.`,
  })

  // -------------------------------------------------------------------------
  // Invoke
  // -------------------------------------------------------------------------

  const result = await agent.invoke({
    messages: [new HumanMessage(question)],
  })

  const lastMessage = result.messages.at(-1)
  return typeof lastMessage?.content === 'string'
    ? lastMessage.content
    : JSON.stringify(lastMessage?.content)
}
