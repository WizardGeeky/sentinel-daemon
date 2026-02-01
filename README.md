# Sentinel Daemon 🛡️

A local, AI-powered file system watchdog that learns rules from natural language.

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-emerald" alt="Status" />
  <img src="https://img.shields.io/badge/Stack-Next.js_·_TypeScript_·_Node_·_Ollama-indigo" alt="Stack" />
</div>

## 🚀 The Challenge
Built for the **HeyAmara Challenge**.
Sentinel is a "set it and forget it" daemon that watches your code while you work, alerting you to pattern violations, security risks, or custom workflow triggers—defined entirely in plain English.

## ✨ Features
- **👀 Watch**: Real-time file system monitoring (powered by Chokidar).
- **🧠 Learn**: Natural Language Processing to convert "Notify me if..." into executable regex rules (powered by local Ollama).
- **💾 Remember**: JSON-based persistence ensures rules survive restarts.
- **🔔 Act**: Instant console notifications and UI alerts.
- **📊 Report**: Beautiful, dark-mode dashboard for monitoring activity and managing rules.

## 🛠️ Prerequisites
1. **Node.js**: v18 or higher.
2. **Ollama**: You must have [Ollama](https://ollama.com/) running locally.
   - Ensure you have a model pulled (default is `llama3`, configurable via `.env`).
   - `ollama pull llama3` (or `mistral`, `gemma`, etc.)

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Check `.env.local` or create one:
```env
WATCH_DIR="./watched"       # Directory to monitor
OLLAMA_HOST="http://localhost:11434"
RULE_LEARNER_MODEL="llama3" # Change to your preferred local model
```

### 3. Start the Daemon (Terminal 1)
This process runs in the background, watching files and evaluating rules.
```bash
npm run daemon:start
```
*You will see "Sentinel daemon started successfully".*

### 4. Start the Dashboard (Terminal 2)
This runs the UI to view logs and add rules.
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🎮 Usage Guide

1. **Verify**: Check the "System Online" status in the top right of the dashboard.
2. **Interact**: Type a rule in the "Natural Language Instruction" box.
   - *"Notify me when any .env file is changed"*
   - *"Alert if a typescript file in /src is deleted"*
   - *"Warn me if someone changes package.json"*
3. **Test**:
   - Go to the `watched` folder (or your configured `WATCH_DIR`).
   - Create, modify, or delete files matching your rules.
   - Watch the dashboard "Live Activity" stream and the console output in Terminal 1.

## 🏗️ Architecture

- **Daemon (`/daemon`)**: Pure Node.js process using `chokidar` for events and `ollama` for intelligence. Stores state in `/data`.
- **Frontend (`/app`)**: Next.js App Router with Tailwind CSS & Framer Motion. Polls the shared `/data` files via API.
- **Shared (`/data`)**: Simple JSON/JSONL flat-file database for zero-config persistence.

## ⚠️ Notes
- The rule engine uses "permissive globbing" (where `*` matches broadly).
- Ensure the `watched` directory exists before starting the daemon (it will be created if missing, but good practice).

---
*Built with ❤️ by Antigravity*
