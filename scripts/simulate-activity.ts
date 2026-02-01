import fs from 'fs';
import path from 'path';

const WATCHED_DIR = path.join(process.cwd(), 'watched');

if (!fs.existsSync(WATCHED_DIR)) {
    fs.mkdirSync(WATCHED_DIR);
}

const actions = [
    // Scenario 1: Add a TypeScript file (Rule: *.ts added)
    () => {
        const file = path.join(WATCHED_DIR, `test-${Date.now()}.ts`);
        console.log(`📝 Creating TS file: ${file}`);
        fs.writeFileSync(file, 'console.log("Hello World");');
    },

    // Scenario 2: Change a JS file (Rule: *.js changed)
    () => {
        const file = path.join(WATCHED_DIR, 'script.js');
        if (!fs.existsSync(file)) fs.writeFileSync(file, '// init');
        console.log(`📝 Modifying JS file: ${file}`);
        fs.appendFileSync(file, '\n// updated');
    },

    // Scenario 3: Delete a JSON file (Rule: *.json deleted)
    () => {
        const file = path.join(WATCHED_DIR, 'data.json');
        fs.writeFileSync(file, '{}'); // ensure it exists first
        setTimeout(() => {
            console.log(`🗑️ Deleting JSON file: ${file}`);
            fs.unlinkSync(file);
        }, 1000);
    },

    // Scenario 4: Sensitive file usage (Rule: .env changed)
    () => {
        const file = path.join(WATCHED_DIR, '.env');
        if (!fs.existsSync(file)) fs.writeFileSync(file, 'SECRET=true');
        console.log(`⚠️ Modifying sensitive file: ${file}`);
        fs.appendFileSync(file, '\nNEW_KEY=123');
    }
];

console.log("🚀 Starting simulation in 3 seconds...");
setTimeout(() => {
    let i = 0;
    const interval = setInterval(() => {
        if (i >= actions.length) {
            clearInterval(interval);
            console.log("✅ Simulation complete. Check your dashboard!");
            return;
        }
        actions[i]();
        i++;
    }, 2000); // 2 seconds between actions
}, 3000);
