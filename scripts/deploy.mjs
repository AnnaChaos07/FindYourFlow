import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkConfiguration, loadConfig } from './config.mjs';

const config = await loadConfig();
const missing = checkConfiguration(config).filter(check => !check.ready);
if (missing.length) {
  for (const check of missing) console.error(check.name + ': ' + check.action);
  process.exit(1);
}
function run(args, env = process.env) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (result.error || result.status !== 0) throw new Error('Deployment-Schritt fehlgeschlagen.');
}
try {
  run(['--run', 'test']);
  run(['--run', 'build']);
  run(['--run', 'check:functions']);
  run(['scripts/check-setup.mjs', '--online']);
  const temporary = await mkdtemp(join(tmpdir(), 'anna-pages-secrets-'));
  try {
    const secrets = Object.fromEntries(['DATABASE_URL', 'ADMIN_PASSWORD_HASH', 'RESEND_API_KEY', 'CONTACT_FROM', 'CONTACT_EMAIL', 'PURPLE_SLOT_BOOKING_URL'].filter(key => config[key]).map(key => [key, config[key]]));
    const file = join(temporary, 'secrets.json');
    await writeFile(file, JSON.stringify(secrets), { mode: 0o600 });
    const project = config.CF_PAGES_PROJECT_NAME || 'yoga-mit-anna';
    const environment = { ...process.env };
    for (const key of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) if (config[key]) environment[key] = config[key];
    run(['node_modules/wrangler/bin/wrangler.js', 'pages', 'secret', 'bulk', file, '--project-name', project], environment);
    run(['node_modules/wrangler/bin/wrangler.js', 'pages', 'deploy', 'out', '--project-name', project, '--branch', 'main'], environment);
  } finally { await rm(temporary, { recursive: true, force: true }); }
} catch (error) { console.error(error.message); process.exitCode = 1; }
