import { randomBytes } from 'node:crypto';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { hashPassword } from '../lib/auth.js';

let existing = '';
try { existing = await readFile('.dev.vars', 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const values = parseEnv(existing);
if (values.ADMIN_PASSWORD_HASH) {
  console.log('Ein Admin-Passwort ist bereits konfiguriert. Es wurde nicht ersetzt.');
} else {
  const password = randomBytes(24).toString('base64url');
  const hash = await hashPassword(password);
  const source = existing || await readFile('.dev.vars.example', 'utf8');
  let next = source.replace(/^ADMIN_PASSWORD_HASH=.*$/m, 'ADMIN_PASSWORD_HASH="' + hash + '"');
  if (!/^ADMIN_PASSWORD_HASH=/m.test(next)) next += '\nADMIN_PASSWORD_HASH="' + hash + '"\n';
  await mkdir('.local', { recursive: true, mode: 0o700 });
  await writeFile('.local/admin-access.txt', 'Admin-Zugang für Yoga mit Anna\nPfad: /admin/\nPasswort: ' + password + '\n\nPrivat aufbewahren. Der zugehörige Hash steht in .dev.vars.\n', { flag: 'wx', mode: 0o600 });
  await writeFile('.dev.vars', next, { mode: 0o600 });
  await chmod('.dev.vars', 0o600);
  console.log('Admin-Zugang erzeugt. Passwort: .local/admin-access.txt; Hash: .dev.vars. Keine Zugangsdaten wurden ausgegeben.');
}
