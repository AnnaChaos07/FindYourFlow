import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

export async function loadConfig(file = '.dev.vars', environment = process.env) {
  try { return { ...environment, ...parseEnv(await readFile(file, 'utf8')) }; }
  catch (error) { if (error.code === 'ENOENT') return { ...environment }; throw error; }
}

export function requireNeonDatabase(config) {
  let url;
  try { url = new URL(config.DATABASE_URL); } catch { throw new Error('DATABASE_URL: Bitte die Neon-Verbindung in .dev.vars eintragen.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname.endsWith('.neon.tech') || !url.username || !url.password || url.pathname.length < 2) {
    throw new Error('DATABASE_URL muss auf die gewünschte Neon-Datenbank zeigen. Die bisherige lokale Datenbank wird nicht verändert.');
  }
  if (!['require', 'verify-full', 'verify-ca'].includes(url.searchParams.get('sslmode'))) throw new Error('Die Neon-Verbindung muss TLS verwenden (sslmode=require).');
  return url.href;
}

export function checkConfiguration(config) {
  const checks = [];
  try { requireNeonDatabase(config); checks.push({ name: 'Neon-Verbindung', ready: true }); }
  catch (error) { checks.push({ name: 'Neon-Verbindung', ready: false, action: error.message }); }
  checks.push({ name: 'Admin-Passwort', ready: /^pbkdf2-sha256:100000:[a-f0-9]{32}:[a-f0-9]{64}$/.test(config.ADMIN_PASSWORD_HASH || ''), action: 'npm run setup:admin ausführen oder ADMIN_PASSWORD_HASH eintragen.' });
  const email = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !/@(?:example\.(?:com|org|net)|localhost)$/i.test(value);
  checks.push({ name: 'E-Mail-API-Zugang', ready: Boolean(config.RESEND_API_KEY?.trim()), action: 'RESEND_API_KEY eintragen.' });
  checks.push({ name: 'Kontakt-Empfänger', ready: email(config.CONTACT_EMAIL), action: 'Echte Empfängeradresse als CONTACT_EMAIL eintragen.' });
  const from = config.CONTACT_FROM?.match(/<([^>]+)>$/)?.[1] || config.CONTACT_FROM;
  checks.push({ name: 'E-Mail-Absender', ready: email(from), action: 'Bei Resend verifizierten Absender als CONTACT_FROM eintragen.' });
  return checks;
}
