import { neon } from '@neondatabase/serverless';
import { handleApi, json } from '../../lib/api.js';

export async function onRequest({ request, env }) {
  try {
    const sql = env.DATABASE_URL ? neon(env.DATABASE_URL) : null;
    return await handleApi(request, env, sql);
  } catch {
    return json({ message: 'Die Datenbankverbindung ist nicht verfügbar.' }, 503);
  }
}
