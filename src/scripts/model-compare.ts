/**
 * Model & prompt engineering comparison script
 * Run with: npx tsx scripts/model-compare.ts
 * Install tsx if needed: npm install -D tsx
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- Sample habit context (mirrors real app data shape) ---
const SAMPLE_CONTEXT = {
  habits: [
    { name: "Morning run", streak: 5, completedToday: false },
    { name: "Read 20 mins", streak: 12, completedToday: true },
    { name: "Meditate", streak: 0, completedToday: false },
  ],
  streaks: { longest: 12, current: 5 },
  coaching_style: "motivational",
};

const SYSTEM_PROMPT = `You are an encouraging habit coach. Be concise, warm, and specific.
Never generic. Reference the actual habits and streak data provided.`;

const USER_PROMPT = `User habits today: ${JSON.stringify(SAMPLE_CONTEXT.habits, null, 2)}
Current streaks: ${JSON.stringify(SAMPLE_CONTEXT.streaks)}
Coaching style preference: ${SAMPLE_CONTEXT.coaching_style}
Generate a short daily nudge (2-3 sentences max).`;

// --- Configurations to compare ---
interface Config {
  label: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

const CONFIGS: Config[] = [
  {
    label: "sonnet-4-6 | temp 0.3 | focused",
    model: "claude-sonnet-4-6",
    temperature: 0.3,
    max_tokens: 150,
  },
  {
    label: "sonnet-4-6 | temp 0.8 | creative",
    model: "claude-sonnet-4-6",
    temperature: 0.8,
    max_tokens: 150,
  },
  {
    label: "sonnet-4-6 | temp 0.5 | balanced",
    model: "claude-sonnet-4-6",
    temperature: 0.5,
    max_tokens: 300, // higher limit — does it actually use it?
  },
  {
    label: "haiku-3-5 | temp 0.5 | fast/cheap",
    model: "claude-haiku-4-5-20251001",
    temperature: 0.5,
    max_tokens: 150,
  },
];

interface Result {
  label: string;
  model: string;
  temperature: number;
  max_tokens: number;
  response: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
}

async function runComparison(): Promise<void> {
  console.log("🔬 Running model comparison...\n");
  const results: Result[] = [];

  for (const cfg of CONFIGS) {
    process.stdout.write(`Testing: ${cfg.label} ... `);
    const start = Date.now();

    try {
      const msg = await client.messages.create({
        model: cfg.model,
        max_tokens: cfg.max_tokens,
        temperature: cfg.temperature,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: USER_PROMPT }],
      });

      const latency = Date.now() - start;
      const text =
        msg.content[0].type === "text" ? msg.content[0].text : "(no text)";

      results.push({
        label: cfg.label,
        model: cfg.model,
        temperature: cfg.temperature,
        max_tokens: cfg.max_tokens,
        response: text,
        input_tokens: msg.usage.input_tokens,
        output_tokens: msg.usage.output_tokens,
        latency_ms: latency,
      });

      console.log(`✅ ${latency}ms`);
    } catch (err) {
      console.log(`❌ Error: ${err}`);
    }
  }

  // --- Print results ---
  console.log("\n" + "=".repeat(80));
  console.log("RESULTS");
  console.log("=".repeat(80));

  for (const r of results) {
    console.log(`\n📊 ${r.label}`);
    console.log(`   Model:    ${r.model}`);
    console.log(`   Temp:     ${r.temperature}`);
    console.log(`   Tokens:   ${r.input_tokens} in / ${r.output_tokens} out`);
    console.log(`   Latency:  ${r.latency_ms}ms`);
    console.log(`   Response: "${r.response}"`);
  }

  // --- Summary table ---
  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY TABLE");
  console.log("=".repeat(80));
  console.log(
    "Label".padEnd(45) + "Latency".padEnd(12) + "In tok".padEnd(10) + "Out tok",
  );
  console.log("-".repeat(80));
  for (const r of results) {
    console.log(
      r.label.padEnd(45) +
        `${r.latency_ms}ms`.padEnd(12) +
        `${r.input_tokens}`.padEnd(10) +
        `${r.output_tokens}`,
    );
  }

  // --- Save to file for reference ---
  const outPath = "src/scripts/model-compare-results.json";
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Full results saved to ${outPath}`);
}

runComparison().catch(console.error);
