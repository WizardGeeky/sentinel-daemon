import { startWatcher, stopWatcher, isWatcherRunning } from "./watcher";
import { createLogger } from "@/lib/logger";

const logger = createLogger("daemon");

let started = false;

export function startDaemon(): void {
  if (started) {
    logger.warn("Daemon already started");
    return;
  }

  try {
    started = true;
    startWatcher();
    logger.info("Sentinel daemon started successfully");

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    started = false;
    logger.error("Failed to start daemon", { error: String(err) });
    throw err;
  }
}

export async function stopDaemon(): Promise<void> {
  if (!started) {
    logger.warn("Daemon not started");
    return;
  }

  try {
    await stopWatcher();
    started = false;
    logger.info("Sentinel daemon stopped");
  } catch (err) {
    logger.error("Failed to stop daemon", { error: String(err) });
    throw err;
  }
}

export function isDaemonRunning(): boolean {
  return started && isWatcherRunning();
}

async function shutdown() {
  logger.info("Shutdown signal received");
  await stopDaemon();
  process.exit(0);
}