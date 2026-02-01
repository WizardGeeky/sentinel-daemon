import fs from "fs";
import path from "path";
import { LogLevel, LogEntry } from "./types";

const logsDir = path.join(process.cwd(), "data");
const logsPath = path.join(logsDir, "logs.jsonl");

function ensureLogsDir() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

export class Logger {
  private module: string;
  private minLevel: LogLevel;

  constructor(module: string, minLevel: LogLevel = LogLevel.INFO) {
    this.module = module;
    this.minLevel = minLevel;
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      module: this.module,
      message,
      data,
    };

    const levelName = LogLevel[level];
    const prefix = `[${this.module}] ${levelName}:`;

    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }

    try {
      ensureLogsDir();
      fs.appendFileSync(logsPath, JSON.stringify(entry) + "\n");
    } catch (err) {
      console.error("Failed to write logs:", err);
    }
  }

  debug(message: string, data?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, any>) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, data);
  }
}

export const createLogger = (module: string) => new Logger(module);