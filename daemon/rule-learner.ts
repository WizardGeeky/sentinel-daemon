import { createLogger } from "@/lib/logger";
import { Rule, RuleSchema } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const logger = createLogger("rule-learner");

async function callOllama(prompt: string, model: string, endpoint: string): Promise<string> {
  try {
    const res = await fetch(`${endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.response;
  } catch (err) {
    throw new Error(`Failed to call Ollama: ${String(err)}`);
  }
}

function createRulePrompt(text: string): string {
  return `You are a rule extraction expert. Convert this natural language rule into a valid JSON object ONLY.

IMPORTANT: Return ONLY the JSON object, no explanation or markdown code blocks.

Schema (use this exact structure):
{
  "id": "generate-unique-id",
  "name": "descriptive-rule-name",
  "filePattern": "glob-pattern-like-*.ts",
  "event": "add|change|unlink|addDir|unlinkDir",
  "threshold": { // OPTIONAL: only include if rule mentions frequency (e.g. '3 times in 5 mins')
    "count": 3,
    "withinMinutes": 5
  },
  "action": "notify",
  "confidence": 0.85,
  "rawText": "${text}"
}

Rule to convert:
${text}

Return ONLY valid JSON, starting with { and ending with }`;
}

export async function learnRule(text: string): Promise<Rule> {
  logger.info("Learning rule Start");

  const endpoint = process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = process.env.RULE_LEARNER_MODEL || "llama3";

  try {
    logger.info("Learning rule from Ollama", { model, text: text.substring(0, 50) });

    const prompt = createRulePrompt(text);
    const response = await callOllama(prompt, model, endpoint);

    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }

    // Extract JSON from response (may contain extra text)
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Sanitize event
    const validEvents = ["add", "change", "unlink", "addDir", "unlinkDir"];
    const event = validEvents.includes(parsed.event) ? parsed.event : "change";

    // Sanitize threshold
    let threshold = undefined;
    if (parsed.threshold &&
      typeof parsed.threshold.count === "number" && parsed.threshold.count > 0 &&
      typeof parsed.threshold.withinMinutes === "number" && parsed.threshold.withinMinutes > 0) {
      threshold = {
        count: Math.floor(parsed.threshold.count),
        withinMinutes: Math.floor(parsed.threshold.withinMinutes)
      };
    }

    const rule: Rule = {
      id: parsed.id || uuidv4(),
      name: parsed.name || "Unnamed Rule",
      filePattern: parsed.filePattern || "**/*",
      event,
      threshold,
      action: "notify",
      confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1),
      createdAt: Date.now(),
      rawText: text,
    };

    // Validate against schema
    const validated = RuleSchema.parse(rule);

    logger.info("Rule learned successfully", { ruleId: validated.id, ruleName: validated.name });
    return validated;
  } catch (err) {
    logger.error("Failed to learn rule", { error: String(err), text: text.substring(0, 50) });
    throw err;
  }
}