import { spawn } from 'node:child_process';

const children = [
  spawn('node', ['node_modules/wrangler/bin/wrangler.js', 'pages', 'dev', 'public', '--port', '8788', '--ip', '127.0.0.1', '--inspector-port', '9230', '--binding', 'DEV_ORIGIN=' + (process.env.DEV_ORIGIN || 'http://localhost:3000')], { stdio: 'inherit' }),
  spawn('node', ['node_modules/next/dist/bin/next', 'dev', '--hostname', '0.0.0.0'], { stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
for (const child of children) {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => stop(code || 0));
}
