import { notify } from "./notifier";
import { getRules } from "./store";
import { createLogger } from "@/lib/logger";
import { Observation, Rule } from "@/lib/types";

const logger = createLogger("rule-engine");

function matchesPattern(path: string, pattern: string): boolean {
  // Support multiple patterns separated by |
  const patterns = pattern.split('|');

  return patterns.some(p => {
    const regexPattern = p
      .trim()
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");

    const regex = new RegExp(`^${regexPattern}$`);
    // Normalize path to use forward slashes for matching
    const normalizedPath = path.replace(/\\/g, '/');
    return regex.test(normalizedPath) || regex.test(path);
  });
}

function evaluateThreshold(
  obs: Observation,
  rule: Rule,
  eventHistory: Map<string, Observation[]>
): boolean {
  if (!rule.threshold) {
    return true;
  }

  const key = `${obs.path}:${obs.event}`;
  const history = eventHistory.get(key) || [];

  const withinWindow = Date.now() - rule.threshold.withinMinutes * 60 * 1000;
  const recentEvents = history.filter((e) => e.timestamp >= withinWindow);

  const matches = recentEvents.length >= rule.threshold.count;

  if (matches) {
    logger.debug("Threshold met", {
      ruleId: rule.id,
      count: recentEvents.length,
      required: rule.threshold.count,
    });
  }

  return matches;
}

export function evaluateRules(
  obs: Observation,
  eventHistory: Map<string, Observation[]>
): void {
  try {
    const rules = getRules();

    for (const rule of rules) {
      // Support multiple events separated by |
      const ruleEvents = rule.event.split('|');
      if (!ruleEvents.includes(obs.event)) continue;

      if (!matchesPattern(obs.path, rule.filePattern)) continue;

      if (!evaluateThreshold(obs, rule, eventHistory)) continue;

      logger.info("Rule matched", { ruleId: rule.id, ruleName: rule.name, path: obs.path });
      notify(rule, obs);
    }
  } catch (err) {
    logger.error("Failed to evaluate rules", { error: String(err) });
  }
}