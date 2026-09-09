import assert from 'node:assert/strict';
const base = new URL(process.argv[2]);
if (!['http:', 'https:'].includes(base.protocol)) throw new Error('Bitte eine HTTP(S)-Adresse angeben.');
for (const path of ['/', '/ueber-mich/', '/kontakt/', '/admin/', '/angebote/', '/api/content', '/api/courses']) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, path);
  console.log('OK: ' + path);
}
const status = await fetch(new URL('/api/admin/status', base));
assert.equal((await status.json()).authenticated, false, 'Adminstatus ohne Sitzung');
const protectedResponse = await fetch(new URL('/api/admin/content', base));
assert.equal(protectedResponse.status, 401, 'Admininhalte ohne Anmeldung');
const content = await (await fetch(new URL('/api/content', base))).json();
assert.equal(content.pages.some(page => !page.published), false, 'Keine öffentlichen Entwürfe');
assert.ok(content.bookingUrl?.startsWith('https://'), 'Buchungslink vorhanden');
console.log('Öffentliche Seiten, API und Zugriffsschutz geprüft. Es wurden keine Nachrichten versendet oder Daten geändert.');
