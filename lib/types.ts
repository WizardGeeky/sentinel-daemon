import { z } from "zod";

// Event types from chokidar
export type FileEvent = "add" | "change" | "unlink" | "addDir" | "unlinkDir" | "error" | "all";

// Observation of a file change
export interface Observation {
  event: FileEvent;
  path: string;
  timestamp: number;
}

// Rule threshold configuration
export const ThresholdSchema = z.object({
  count: z.number().int().positive(),
  withinMinutes: z.number().int().positive(),
});

export type Threshold = z.infer<typeof ThresholdSchema>;

// Rule definition
export const RuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  filePattern: z.string(),
  event: z.enum(["add", "change", "unlink", "addDir", "unlinkDir"]),
  threshold: ThresholdSchema.optional(),
  action: z.enum(["notify"]),
  confidence: z.number().min(0).max(1),
  createdAt: z.number(),
  rawText: z.string(),
});

export type Rule = z.infer<typeof RuleSchema>;

// API request/response types
export const LearnRuleRequestSchema = z.object({
  text: z.string().min(10),
});

export type LearnRuleRequest = z.infer<typeof LearnRuleRequestSchema>;

// Logger levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, any>;
}

// Event log entry
export interface EventLogEntry extends Observation {
  id: string;
}

// Rule match event
export interface RuleMatchEvent {
  ruleId: string;
  ruleName: string;
  observation: Observation;
  timestamp: number;
  confidence: number;
}