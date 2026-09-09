import readline from 'node:readline/promises';
import { Writable } from 'node:stream';
import { hashPassword } from '../lib/auth.js';

if (!process.stdin.isTTY) throw new Error('Bitte in einem interaktiven Terminal starten.');
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
process.stdout.write('Neues Admin-Passwort (mindestens 14 Zeichen): ');
muted = true;
const password = await rl.question('');
process.stdout.write('\nPasswort wiederholen: ');
const confirmation = await rl.question('');
rl.close();
process.stdout.write('\n');
if (password.length < 14 || password.length > 1024 || password !== confirmation) throw new Error('Passwörter stimmen nicht überein oder haben eine ungültige Länge.');
console.log('Als ADMIN_PASSWORD_HASH in .dev.vars bzw. Cloudflare Secrets setzen:\n' + await hashPassword(password));
