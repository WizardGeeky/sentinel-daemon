import { isDaemonRunning } from "@/daemon/daemon";
import { startDaemon } from "@/daemon/daemon";

// Ensure daemon is started if not already
if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.VERCEL !== '1' && process.env.SKIP_DAEMON !== '1') {
  startDaemon();
}

export async function GET() {
  return Response.json({
    status: isDaemonRunning() ? "running" : "stopped",
    timestamp: new Date().toISOString(),
  });
}