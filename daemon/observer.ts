import { evaluateRules } from "./rule-engine";
import { logEvent } from "./store";
import { createLogger } from "@/lib/logger";
import { Observation, EventLogEntry } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const logger = createLogger("observer");

const eventHistory: Map<string, Observation[]> = new Map();

export function handleObservation(obs: Observation): void {
  try {
    const eventLog: EventLogEntry = {
      id: uuidv4(),
      ...obs,
    };

    logEvent(eventLog);

    const key = `${obs.path}:${obs.event}`;
    if (!eventHistory.has(key)) {
      eventHistory.set(key, []);
    }
    eventHistory.get(key)!.push(obs);

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const history = eventHistory.get(key)!;
    const filtered = history.filter((e) => e.timestamp > oneHourAgo);
    eventHistory.set(key, filtered);

    logger.info("Event recorded", { event: obs.event, path: obs.path });

    evaluateRules(obs, eventHistory);
  } catch (err) {
    logger.error("Failed to handle observation", { error: String(err), path: obs.path });
  }
}

export function getEventHistory(path: string, event: string): Observation[] {
  const key = `${path}:${event}`;
  return eventHistory.get(key) || [];
}

export function clearEventHistory(): void {
  eventHistory.clear();
  logger.info("Event history cleared");
}