import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import { loadConfig, requireNeonDatabase } from './config.mjs';

const config = await loadConfig();
const sql = neon(requireNeonDatabase(config));
await sql`CREATE TABLE IF NOT EXISTS app_migration (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
const files = ['001_schema.sql', '003_cms.sql', ...(process.argv.includes('--seed') ? ['002_seed.sql'] : [])];
for (const name of files) {
  const seed = name === '002_seed.sql';
  if (!seed && (await sql`SELECT name FROM app_migration WHERE name = ${name}`).length) { console.log(`${name}: bereits angewendet`); continue; }
  const source = await readFile(new URL('../database/' + name, import.meta.url), 'utf8');
  // These versioned migrations contain no procedural SQL or semicolons in literals.
  const statements = source.replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean);
  await sql.transaction([...statements.map(statement => sql.query(statement)), ...(!seed ? [sql`INSERT INTO app_migration (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`] : [])]);
  console.log(`${name}: abgeschlossen`);
}
