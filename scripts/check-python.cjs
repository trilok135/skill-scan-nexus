const { execSync } = require('child_process');

const commands = ['py --version', 'python3 --version', 'python --version'];
let found = false;

for (const cmd of commands) {
    try {
        const version = execSync(cmd, { stdio: 'pipe' }).toString().trim();
        console.log(`✅ Python found: ${version}`);
        found = true;
        break;
    } catch (_) { }
}

if (!found) {
    console.error(`
❌ Python not found. Install Python 3.11 from https://python.org
   During install: CHECK "Add Python to PATH"
   Then restart terminal and run: npm run dev:all
`);
    process.exit(1);
}
