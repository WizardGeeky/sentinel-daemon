import { logRuleMatch } from "./store";
import { createLogger } from "@/lib/logger";
import { Rule, Observation, RuleMatchEvent } from "@/lib/types";

const logger = createLogger("notifier");

export interface NotificationHandler {
  (rule: Rule, obs: Observation): Promise<void>;
}

const handlers: NotificationHandler[] = [];

export function registerNotificationHandler(handler: NotificationHandler): void {
  handlers.push(handler);
  logger.info("Notification handler registered");
}

export function notify(rule: Rule, obs: Observation): void {
  try {
    const matchEvent: RuleMatchEvent = {
      ruleId: rule.id,
      ruleName: rule.name,
      observation: obs,
      timestamp: Date.now(),
      confidence: rule.confidence,
    };

    logRuleMatch(matchEvent);

    handlers.forEach((handler) => {
      handler(rule, obs).catch((err) => {
        logger.error("Notification handler failed", {
          error: String(err),
          ruleId: rule.id,
        });
      });
    });

    console.log("\n");
    console.log("╔════════════════════════════════════╗");
    console.log("║   🚨 SENTINEL RULE MATCHED 🚨      ║");
    console.log("╚════════════════════════════════════╝");
    console.log(`Rule: ${rule.name}`);
    console.log(`Event: ${obs.event}`);
    console.log(`Path: ${obs.path}`);
    console.log(`Confidence: ${(rule.confidence * 100).toFixed(1)}%`);
    console.log("═".repeat(36));
    console.log("\n");
  } catch (err) {
    logger.error("Failed to notify", { error: String(err), ruleId: rule.id });
  }
}

registerNotificationHandler(async (rule, obs) => {
  logger.info("Notification sent", {
    ruleName: rule.name,
    event: obs.event,
    path: obs.path,
  });
});