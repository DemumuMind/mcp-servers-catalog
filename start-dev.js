const { spawn } = require('child_process');
const _path = require('path');

const child = spawn('npx', ['next', 'dev'], {
  cwd: __dirname,
  shell: true,
  detached: true,
  stdio: 'ignore',
  env: { ...process.env, PORT: process.env.PORT || '3000' }
});

child.unref();

// Keep the script alive briefly to ensure the process starts
setTimeout(() => {
  process.exit(0);
}, 3000);
