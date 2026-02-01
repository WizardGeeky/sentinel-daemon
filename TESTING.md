# 🧪 Sentinel Testing Guide

This guide describes how to verify the 4 core capabilities of the Sentinel Daemon using the Dashboard.

## 🛑 Prerequisite: Fix Ollama (If "Learning" fails)
If you see "Ollama error: Not Found" in your logs, your AI engine is not reachable.
1. Open a new terminal.
2. Run `ollama serve`.
3. In another terminal, run `ollama pull llama2` (or your preferred model) to ensure it's ready.

---

## 1. Test "Watch" (Real-time Monitoring)
**Goal**: Verify the dashboard sees file system events.

1. Open Dashboard: [http://localhost:3000](http://localhost:3000)
2. Go to the **Live Logs** tab.
3. Open the `sentinel-daemon/watched` folder in your file explorer.
4. Create a new text file `hello.txt`.
5. **Observation**: You should instantly see a green `ADD` event in the Live Logs.

---

## 2. Test "Act" (Rule Enforcement)
**Goal**: Verify that specific file patterns trigger specific rules.

### Case A: TypeScript Monitor
*Rule: "TS file added"*
1. In `watched/`, create `api.ts`.
2. **Observation**: 
   - Dashboard **Live Logs**: Shows `ADD api.ts` (Green).
   - Dashboard **Home**: "Recent Matches" widget (bottom right) updates.
   - **Terminal 1** (Daemon): Prints "🚨 SENTINEL RULE MATCHED 🚨".

### Case B: Security Guard
*Rule: "Sensitive file changed"*
1. In `watched/`, create `.env` file.
2. Open it and add `API_KEY=123`, then save.
3. **Observation**: The dashboard should flag this as a match for the "Sensitive file changed" rule with high confidence (95%).

### Case C: Destruction Watchdog
*Rule: "JSON file deleted"*
1. Create `config.json` in `watched/`.
2. Delete `config.json`.
3. **Observation**: Red `UNLINK` event in logs, plus a rule match alert.

---

## 3. Test "Learn" (Natural Language AI)
**Goal**: Verify the system can understand English instructions.

1. Go to the **Dashboard** home tab.
2. In the "Natural Language Processor" box, type:
   > *"Notify me if anyone creates a python script in the server directory"*
3. Click "Teach Sentinel" (or press Enter).
4. **Observation**:
   - The Spinner activates.
   - After 2-5 seconds, a success alert appears.
   - Go to **Rules Engine** tab.
   - Search for "python" or scroll down.
   - You should see a new rule (e.g., `*.py`) created by the AI.

---

## ⚡ Quick Test Scripts
We have included a script to simulate all the above automatically.

1. Run the simulation:
   ```bash
   npx ts-node scripts/simulate-activity.ts
   ```
2. Watch your dashboard illuminate with events and alerts!
