const { spawn } = require('child_process');
const path = require('path');

const child = spawn('npx', ['next', 'dev'], {
  cwd: __dirname,
  shell: true,
  detached: true,
  stdio: 'ignore',
  env: { ...process.env, PORT: '3000' }
});

child.unref();
console.log('Dev server starting with PID:', child.pid);

// Keep the script alive briefly to ensure the process starts
setTimeout(() => {
  console.log('Script exiting, dev server should be running');
  process.exit(0);
}, 3000);
