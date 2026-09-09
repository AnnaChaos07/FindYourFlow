import { HttpError } from './validation.js';
const encoder = new TextEncoder();
export const hex = (bytes) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
const unhex = value => Uint8Array.from(value.match(/.{2}/g), b => parseInt(b, 16));
export async function digest(value) {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}
export async function hashPassword(password, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(salt), iterations: 100000 }, key, 256);
  return `pbkdf2-sha256:100000:${salt}:${hex(new Uint8Array(hash))}`;
}
export async function verifyPassword(password, configured) {
  if (!/^pbkdf2-sha256:100000:[a-f0-9]{32}:[a-f0-9]{64}$/.test(configured || '')) {
    throw new HttpError(503, 'Die Anmeldung ist noch nicht eingerichtet.');
  }
  const actual = await hashPassword(password, configured.split(':')[2]);
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ configured.charCodeAt(i);
  return difference === 0;
}
export function sessionToken(request) {
  return request.headers.get('cookie')?.match(/(?:^|;\s*)anna_session=([a-f0-9]{64})(?:;|$)/)?.[1] || '';
}
export function sessionCookie(request, token, maxAge = 28800) {
  return `anna_session=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export async function authenticated(request, sql) {
  const token = sessionToken(request);
  if (!token) return false;
  const rows = await sql`SELECT token_hash FROM admin_session WHERE token_hash = ${await digest(token)} AND expires_at > now()`;
  return rows.length > 0;
}
export function checkOrigin(request, env) {
  const origin = request.headers.get('origin');
  const local = new URL(request.url).hostname;
  const allowedDev = ['localhost', '127.0.0.1'].includes(local) && env.DEV_ORIGIN && origin === env.DEV_ORIGIN;
  if (origin !== new URL(request.url).origin && !allowedDev) throw new HttpError(403, 'Die Anfrage stammt nicht von dieser Website.');
}
export async function rateLimit(request, sql, scope, maximum) {
  const key = await digest(`${scope}:${request.headers.get('cf-connecting-ip') || 'local'}`);
  await sql`DELETE FROM request_limit WHERE expires_at < now()`;
  const [row] = await sql`INSERT INTO request_limit (key, attempts, expires_at) VALUES (${key}, 1, now() + interval '15 minutes')
    ON CONFLICT (key) DO UPDATE SET attempts = request_limit.attempts + 1 RETURNING attempts`;
  if (row.attempts > maximum) throw new HttpError(429, 'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.');
}
