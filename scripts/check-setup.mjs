import { mkdir, writeFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import { checkConfiguration, loadConfig, requireNeonDatabase } from './config.mjs';

const config = await loadConfig();
const checks = checkConfiguration(config);
if (process.argv.includes('--online') && checks[0].ready) {
  try {
    const sql = neon(requireNeonDatabase(config));
    const rows = await sql`SELECT name FROM app_migration`;
    checks.push({ name: 'Datenbankmigrationen', ready: ['001_schema.sql', '003_cms.sql'].every(name => rows.some(row => row.name === name)), action: 'npm run db:migrate ausführen.' });
    const content = await sql`SELECT setting_key, setting_value FROM site_setting WHERE setting_key IN ('pages', 'aboutText')`;
    const pages = JSON.parse(content.find(row => row.setting_key === 'pages')?.setting_value || '[]');
    checks.push({ name: 'Impressum-Inhalt', required: false, ready: pages.some(page => page.slug === 'impressum' && page.published && page.sections.some(section => section.body?.trim())), action: 'Geprüfte Anbieterangaben im Adminpanel ergänzen und veröffentlichen.' });
    checks.push({ name: 'Datenschutz-Inhalt', required: false, ready: pages.some(page => page.slug === 'datenschutz' && page.published && page.sections.some(section => section.body?.trim())), action: 'Passenden Datenschutztext im Adminpanel ergänzen und veröffentlichen.' });
  } catch { checks.push({ name: 'Neon-Erreichbarkeit', ready: false, action: 'Neon-Zugang und Datenbankmigrationen prüfen.' }); }
}
for (const check of checks) console.log(`${check.ready ? 'OK' : 'OFFEN'}: ${check.name}${check.ready ? '' : ' – ' + check.action}`);
await mkdir('.local', { recursive: true, mode: 0o700 });
await writeFile('.local/setup-status.json', JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2) + '\n', { mode: 0o600 });
if (checks.some(check => !check.ready && check.required !== false)) process.exitCode = 1;
