import fs from "fs";
import path from "path";
import { Rule, EventLogEntry, RuleMatchEvent } from "@/lib/types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("store");
const dataDir = path.join(process.cwd(), "data");
const rulesPath = path.join(dataDir, "rules.json");
const eventsPath = path.join(dataDir, "events.jsonl");
const matchesPath = path.join(dataDir, "matches.jsonl");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    logger.info("Created data directory");
  }
}

function initializeFiles() {
  ensureDataDir();

  if (!fs.existsSync(rulesPath)) {
    fs.writeFileSync(rulesPath, JSON.stringify([], null, 2));
    logger.info("Created rules.json");
  }

  if (!fs.existsSync(eventsPath)) {
    fs.writeFileSync(eventsPath, "");
    logger.info("Created events.jsonl");
  }

  if (!fs.existsSync(matchesPath)) {
    fs.writeFileSync(matchesPath, "");
    logger.info("Created matches.jsonl");
  }
}

export function getRules(): Rule[] {
  try {
    initializeFiles();
    let content = fs.readFileSync(rulesPath, "utf-8");

    // Remove BOM if present (UTF-16 or UTF-8 BOM)
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    // Parse and validate
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    logger.error("Failed to read rules", { error: String(err) });
    // Return empty array and try to recover by writing clean rules.json
    try {
      fs.writeFileSync(rulesPath, JSON.stringify([], null, 2), "utf-8");
      logger.info("Recovered: wrote clean rules.json");
    } catch (writeErr) {
      logger.error("Failed to recover rules.json", { error: String(writeErr) });
    }
    return [];
  }
}

export function saveRule(rule: Rule): void {
  try {
    initializeFiles();
    const rules = getRules();
    rules.push(rule);
    fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2));
    logger.info("Rule saved", { ruleId: rule.id, ruleName: rule.name });
  } catch (err) {
    logger.error("Failed to save rule", { error: String(err) });
    throw err;
  }
}

export function deleteRule(ruleId: string): void {
  try {
    initializeFiles();
    const rules = getRules();
    const filtered = rules.filter((r) => r.id !== ruleId);
    fs.writeFileSync(rulesPath, JSON.stringify(filtered, null, 2));
    logger.info("Rule deleted", { ruleId });
  } catch (err) {
    logger.error("Failed to delete rule", { error: String(err) });
    throw err;
  }
}

export function logEvent(event: EventLogEntry): void {
  try {
    initializeFiles();
    fs.appendFileSync(eventsPath, JSON.stringify(event) + "\n");
  } catch (err) {
    logger.error("Failed to log event", { error: String(err), path: event.path });
  }
}

export function logRuleMatch(match: RuleMatchEvent): void {
  try {
    initializeFiles();
    fs.appendFileSync(matchesPath, JSON.stringify(match) + "\n");
    logger.info("Rule matched", { ruleId: match.ruleId, ruleName: match.ruleName });
  } catch (err) {
    logger.error("Failed to log rule match", { error: String(err) });
  }
}

export function getEvents(limit: number = 100): EventLogEntry[] {
  try {
    initializeFiles();
    const content = fs.readFileSync(eventsPath, "utf-8");
    const lines = content.trim().split("\n").filter((l) => l && !l.trim().startsWith("//"));
    return lines.slice(-limit).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter((x): x is EventLogEntry => x !== null);
  } catch (err) {
    logger.error("Failed to read events", { error: String(err) });
    return [];
  }
}

export function getMatches(limit: number = 100): RuleMatchEvent[] {
  try {
    initializeFiles();
    const content = fs.readFileSync(matchesPath, "utf-8");
    const lines = content.trim().split("\n").filter((l) => l && !l.trim().startsWith("//"));
    return lines.slice(-limit).map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter((x): x is RuleMatchEvent => x !== null);
  } catch (err) {
    logger.error("Failed to read matches", { error: String(err) });
    return [];
  }
}