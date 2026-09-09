import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkConfiguration, loadConfig, requireNeonDatabase } from '../scripts/config.mjs';

test('local configuration overrides inherited legacy database settings', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'anna-config-test-'));
  try {
    const file = join(directory, '.dev.vars');
    await writeFile(file, 'DATABASE_URL=""\n');
    const config = await loadConfig(file, { DATABASE_URL: 'postgresql://old:old@database/old' });
    assert.equal(config.DATABASE_URL, '');
    assert.throws(() => requireNeonDatabase(config));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('migrations reject local databases and Neon without TLS', () => {
  assert.throws(() => requireNeonDatabase({ DATABASE_URL: 'postgresql://user:pass@database/app' }));
  assert.throws(() => requireNeonDatabase({ DATABASE_URL: 'postgresql://user:pass@sample.neon.tech/app' }));
  assert.match(requireNeonDatabase({ DATABASE_URL: 'postgresql://user:pass@sample.neon.tech/app?sslmode=require' }), /neon.tech/);
});
test('setup checks expose no secret values and reject placeholder mail addresses', () => {
  const checks = checkConfiguration({ DATABASE_URL: 'very-secret', ADMIN_PASSWORD_HASH: 'secret-hash', RESEND_API_KEY: 'private-token', CONTACT_FROM: 'website@example.com', CONTACT_EMAIL: 'anna@example.com' });
  assert.doesNotMatch(JSON.stringify(checks), /very-secret|secret-hash|private-token/);
  assert.equal(checks.find(check => check.name === 'Kontakt-Empfänger').ready, false);
});
