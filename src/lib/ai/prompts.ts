import { readFile } from "fs/promises";
import path from "path";

/** Parsed structure of a prompt YAML file. */
interface PromptFile {
  name: string;
  description: string;
  version: string;
  model: string;
  system: string;
  user_template: string;
}

/** Interpolated prompt ready to send to the Claude API. */
export interface LoadedPrompt {
  model: string;
  system: string;
  user: string;
}

const PROMPTS_DIR = path.join(process.cwd(), ".claude", "prompts");

/**
 * Parses the subset of YAML used by prompt files.
 * Supports scalar fields (`key: value`) and block scalars (`key: |`).
 * Not a general YAML parser — only handles the fixed structure of prompt files.
 */
function parsePromptYaml(raw: string): PromptFile {
  const lines = raw.split("\n");
  const result: Record<string, string> = {};

  let currentKey: string | null = null;
  let blockLines: string[] = [];

  const flushBlock = () => {
    if (!currentKey || blockLines.length === 0) return;
    // Determine the common indentation level of non-empty lines
    const nonEmpty = blockLines.filter((l) => l.trim().length > 0);
    const minIndent = nonEmpty.length
      ? Math.min(...nonEmpty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0))
      : 0;
    result[currentKey] = blockLines
      .map((l) => l.slice(minIndent))
      .join("\n")
      .trimEnd();
    currentKey = null;
    blockLines = [];
  };

  for (const line of lines) {
    // Block scalar: `key: |`
    const blockMatch = /^(\w+):\s*\|/.exec(line);
    // Inline scalar: `key: value` (not indented)
    const inlineMatch = /^(\w+):\s*(.+)/.exec(line);

    if (blockMatch) {
      flushBlock();
      currentKey = blockMatch[1];
      blockLines = [];
    } else if (inlineMatch && !line.startsWith(" ") && !line.startsWith("\t")) {
      flushBlock();
      let value = inlineMatch[2].trim();
      // Strip surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[inlineMatch[1]] = value;
    } else if (currentKey !== null) {
      blockLines.push(line);
    }
  }

  flushBlock();

  const required = [
    "name",
    "description",
    "version",
    "model",
    "system",
    "user_template",
  ];
  for (const key of required) {
    if (!result[key])
      throw new Error(`Prompt YAML missing required field: "${key}"`);
  }

  return result as unknown as PromptFile;
}

/**
 * Replaces `{{variable}}` placeholders in a template string with provided values.
 * Unknown placeholders are left as-is.
 */
function interpolate(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key: string) => variables[key] ?? match,
  );
}

/**
 * Loads a prompt YAML file by name, interpolates `{{variable}}` placeholders,
 * and returns the model, system prompt, and user message ready to pass to the Claude API.
 *
 * @param name - Filename without extension (e.g. "daily-coaching-nudge")
 * @param variables - Key/value map of placeholder values
 */
export async function loadPrompt(
  name: string,
  variables: Record<string, string>,
): Promise<LoadedPrompt> {
  const filePath = path.join(PROMPTS_DIR, `${name}.yaml`);
  const raw = await readFile(filePath, "utf-8");
  const parsed = parsePromptYaml(raw);

  return {
    model: parsed.model,
    system: interpolate(parsed.system, variables),
    user: interpolate(parsed.user_template, variables),
  };
}
