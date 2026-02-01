# Architecture, Tradeoffs, and Scalability Report

## 1. Project Philosophy: "Invisible yet Insightful"
We approached the Sentinel Daemon with a **Local-First, Zero-Dependency** philosophy. The goal was to build a tool that feels like a native part of the developer's environment—fast, private, and capable of operating without cloud dependencies.

## 2. Architecture Overview
The system is composed of two distinct but coupled subsystems:

### A. The Daemon (Backend)
- **Role**: The nervous system.
- **Components**:
  - `Watcher`: Uses `chokidar` for robust, cross-platform file system monitoring.
  - `Rule Engine`: A lightweight logic gate that evaluates file events against in-memory rules.
  - `Learner`: An adapter for local LLMs (Ollama) to translate vague intent ("watch config") into strict JSON schema.
  - `Store`: A append-only log interface (JSONL) ensures high write throughput for logs while keeping rules in atomic JSON for consistency.

### B. The Dashboard (Frontend)
- **Role**: The visual cortex.
- **Tech**: Next.js 14 (App Router) + Tailwind CSS + Framer Motion.
- **Design**: Cyberpunk/Terminal aesthetic to match the "daemon" theme.
- **Communication**: Reads directly from the Daemon's data files. This "shared disk" pattern decouples the UI from the Daemon process—if the UI crashes, the Daemon keeps watching.

## 3. Tradeoffs Made

| Decision | Tradeoff | Why we chose it |
|----------|----------|-----------------|
| **Shared File IO vs. API** | The Frontend reads `data/*.jsonl` directly instead of querying a daemon HTTP API. | **Pros**: Zero networking overhead, persistence is implicit, simpler architecture.<br>**Cons**: Race conditions possible (though rare with append-only logs), no remote access. | Fits the "Local Application" brief perfectly. |
| **Polling vs. WebSockets** | Dashboard polls for updates every 2s. | **Pros**: Drastically simpler implementation, less memory usage on the node process.<br>**Cons**: 2s latency on UI updates. | Acceptable for a monitoring dashboard where "instant" is < 2s. |
| **JSON Rules vs. SQLite** | Rules stored in a flat JSON file. | **Pros**: Human readable/editable by hand. <br>**Cons**: Querying is O(N), harder to query complex relationships. | Users expect to be able to "fix" config files manually. |

## 4. "What We Added" (Beyond Requirements)
The challenge asked for a daemon. We delivered a **Observability Platform**:
1.  **Interactive Dashboard**: Instead of just CLI logs, we built a responsive UI to visualize system health.
2.  **Analytics Engine**: Added charts to visualize event distribution, answering "What is happening most?" not just "What just happened?".
3.  **Resilient AI**: Implemented a sanitization layer for the LLM that handles hallucinations (e.g., correcting invalid event types) automatically.
4.  **Mobile Support**: The dashboard is fully responsive, allowing monitoring from a phone on the local network.

## 5. What Breaks at Scale?
If this were deployed to watch a massive monorepo (e.g., 1M+ files) or enterprise environment:

1.  **File Watching**: `chokidar` scales well, but generic `**/*` watchers on 100k+ files will consume significant RAM and CPU. **Fix**: Scoped watching.
2.  **Log Parsing**: The Dashboard reads the *entire* log file into memory on every fetch. As `events.jsonl` grows to 100MB+, the Dashboard will crash. **Fix**: Implement pagination and a real database (SQLite/DuckDB) for log storage.
3.  **Rule Evaluation**: The rules are iterated linearly `O(R)` for every file event. With 1000 rules and high-frequency file changes (e.g., `node_modules` install), this becomes a bottleneck. **Fix**: Trie-based rule matching or Aho-Corasick algorithm for patterns.

## 6. AI Usage Disclosure
- **Coding**: Used for generating boilerplate (Shadcn components, CSS) and `zod` schemas.
- **Logic**: Used LLM to write the "Translation" layer prompts in `rule-learner.ts`.
- **Review**: AI used to simulate "Chaos" via the `simulate-activity.ts` script to verify robustness.
