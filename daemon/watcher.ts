import { watch, type FSWatcher } from "chokidar";
import { handleObservation } from "./observer";
import { createLogger } from "@/lib/logger";
import { FileEvent } from "@/lib/types";

const logger = createLogger("watcher");

let watcher: FSWatcher | null = null;
let isWatching = false;

export function startWatcher(): void {
  if (isWatching && watcher) {
    logger.warn("Watcher already started");
    return;
  }

  const dir = process.env.WATCH_DIR || "./watched";

  try {
    watcher = watch(dir, {
      ignoreInitial: true,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
      ignored: /(^|[\/\\])\.|node_modules|\.next/,
      usePolling: process.env.USE_POLLING === "true",
    });

    watcher
      .on("all", (event: string, path: string) => {
        handleObservation({
          event: event as FileEvent,
          path,
          timestamp: Date.now(),
        });
      })
      .on("error", (error) => {
        logger.error("Watcher error", { error: String(error) });
      })
      .on("ready", () => {
        isWatching = true;
        logger.info("Watcher ready", { dir });
      });
  } catch (err) {
    logger.error("Failed to start watcher", { error: String(err), dir });
    throw err;
  }
}

export function stopWatcher(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!watcher) {
      resolve();
      return;
    }

    watcher
      .close()
      .then(() => {
        isWatching = false;
        watcher = null;
        logger.info("Watcher stopped");
        resolve();
      })
      .catch((err) => {
        logger.error("Failed to stop watcher", { error: String(err) });
        reject(err);
      });
  });
}

export function isWatcherRunning(): boolean {
  return isWatching;
}