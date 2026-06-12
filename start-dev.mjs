// ESM module to start dev server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const child = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  shell: true,
  detached: true,
  stdio: 'ignore'
});

child.unref();
console.log('Dev server starting with PID:', child.pid);

// Keep the process alive briefly
setTimeout(() => {
  process.exit(0);
}, 2000);
