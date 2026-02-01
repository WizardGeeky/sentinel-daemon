import fs from "fs/promises";
import path from "path";

export async function GET(_req: Request) {
  try {
    const eventsPath = path.join(process.cwd(), "data", "events.jsonl");

    // File not found → return empty list
    try {
      await fs.access(eventsPath);
    } catch {
      return new Response(
        JSON.stringify({ events: [] }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Read file contents (events + system logs)
    const [eventsContent, logsContent] = await Promise.all([
      fs.readFile(eventsPath, "utf-8").catch(() => ""),
      fs.readFile(path.join(process.cwd(), "data", "logs.jsonl"), "utf-8").catch(() => "")
    ]);

    const events = [
      ...eventsContent.trim().split("\n"),
      ...logsContent.trim().split("\n")
    ].map((line) => {
      try {
        if (!line.trim()) return null;
        const p = JSON.parse(line);
        // Standardize structure: events have 'id', logs have 'message'.
        // Ensure they all have 'timestamp' for sorting.
        if (!p || (!p.timestamp && !p.createdAt)) return null;
        return p;
      } catch { return null; }
    }).filter(e => e !== null)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    return new Response(
      JSON.stringify({ events }), // Keep key 'events' to avoid breaking frontend immediately
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to read events" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
