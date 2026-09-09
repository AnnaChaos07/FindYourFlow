import { decodeContent, publicContent, validateContent } from './cms.js';
import { HttpError, validateCourse, validateContact, readJson, readBody, imageType } from './validation.js';
import { authenticated, checkOrigin, digest, hex, rateLimit, sessionCookie, sessionToken, verifyPassword } from './auth.js';

export function json(data, status = 200, headers = {}) {
  return new Response(status === 204 ? null : JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers,
  } });
}
async function content(sql, env) {
  const rows = await sql`SELECT setting_key, setting_value FROM site_setting`;
  return decodeContent(rows, env);
}
const courseColumns = row => ({ id: row.id, slug: row.slug, title: row.title, teaser: row.teaser, duration: row.duration, price: row.price, bookingUrl: row.booking_url || '', published: row.published, sortOrder: row.sort_order, description: row.description });

export async function handleApi(request, env, sql, fetchEmail = fetch) {
  try {
    const path = new URL(request.url).pathname.replace(/\/$/, '');
    const method = request.method;
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) return json({ message: 'Methode nicht erlaubt.' }, 405, { Allow: 'GET, POST, PUT, DELETE' });
    if (method !== 'GET') checkOrigin(request, env);
    if (path === '/api/bookings') throw new HttpError(410, 'Buchungen erfolgen jetzt über Purple Slot. Bitte die Angebotsseite neu öffnen.');
    if (!sql) throw new HttpError(503, 'Die Datenbank ist noch nicht eingerichtet.');

    if (path === '/api/admin/status' && method === 'GET') return json({ authenticated: await authenticated(request, sql) });
    if (path === '/api/admin/login' && method === 'POST') {
      await rateLimit(request, sql, 'login', 5);
      const { password } = await readJson(request);
      if (typeof password !== 'string' || !password || password.length > 1024) throw new HttpError(400, 'Bitte ein gültiges Passwort eingeben.');
      if (!await verifyPassword(password, env.ADMIN_PASSWORD_HASH)) throw new HttpError(403, 'Das Passwort ist nicht korrekt.');
      const token = hex(crypto.getRandomValues(new Uint8Array(32)));
      await sql`DELETE FROM admin_session WHERE expires_at < now()`;
      await sql`INSERT INTO admin_session (token_hash, expires_at) VALUES (${await digest(token)}, now() + interval '8 hours')`;
      return json({ authenticated: true }, 200, { 'Set-Cookie': sessionCookie(request, token) });
    }
    if (path.startsWith('/api/admin/')) {
      if (!await authenticated(request, sql)) throw new HttpError(401, 'Bitte zuerst anmelden.');
      if (path === '/api/admin/logout' && method === 'POST') {
        await sql`DELETE FROM admin_session WHERE token_hash = ${await digest(sessionToken(request))}`;
        return json({ authenticated: false }, 200, { 'Set-Cookie': sessionCookie(request, '', 0) });
      }
      if (path === '/api/admin/content' && method === 'GET') return json(await content(sql, env));
      if (path === '/api/admin/content' && method === 'PUT') {
        const data = await readJson(request, 1024 * 1024);
        const updates = validateContent(data);
        if (updates.length) await sql.transaction(updates.map(([key, value]) => sql`INSERT INTO site_setting (setting_key, setting_value) VALUES (${key}, ${value}) ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`));
        return json(await content(sql, env));
      }
      if (path === '/api/admin/courses' && method === 'GET') return json((await sql`SELECT * FROM course ORDER BY sort_order, id`).map(courseColumns));
      const match = path.match(/^\/api\/admin\/courses\/(\d+)$/);
      if ((path === '/api/admin/courses' && method === 'POST') || (match && method === 'PUT')) {
        const data = validateCourse(await readJson(request));
        const rows = match
          ? await sql`UPDATE course SET slug = ${data.slug}, title = ${data.title}, teaser = ${data.teaser}, duration = ${data.duration}, price = ${data.price}, booking_url = ${data.bookingUrl}, published = ${data.published}, sort_order = ${data.sortOrder}, description = ${data.description} WHERE id = ${match[1]} RETURNING *`
          : await sql`INSERT INTO course (slug, title, teaser, duration, price, booking_url, published, sort_order, description) VALUES (${data.slug}, ${data.title}, ${data.teaser}, ${data.duration}, ${data.price}, ${data.bookingUrl}, ${data.published}, ${data.sortOrder}, ${data.description}) RETURNING *`;
        if (!rows.length) throw new HttpError(404, 'Kurs nicht gefunden.');
        return json(courseColumns(rows[0]), match ? 200 : 201);
      }
      if (match && method === 'DELETE') {
        const rows = await sql`DELETE FROM course WHERE id = ${match[1]} RETURNING id`;
        if (!rows.length) throw new HttpError(404, 'Kurs nicht gefunden.');
        return json(null, 204);
      }
      if (path === '/api/admin/images' && method === 'GET') {
        const rows = await sql`SELECT id, media_type, created_at FROM site_image ORDER BY created_at DESC LIMIT 100`;
        return json(rows.map(row => ({ id: row.id, path: '/api/images/' + row.id, mediaType: row.media_type, createdAt: row.created_at })));
      }
      if (path === '/api/admin/image' && method === 'POST') {
        const bytes = await readBody(request, 2 * 1024 * 1024 + 16000);
        let form;
        try { form = await new Response(bytes, { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData(); }
        catch { throw new HttpError(400, 'Ungültiger Bild-Upload.'); }
        const target = form.get('target') || 'heroImage';
        if (!['heroImage', 'aboutImage', 'library'].includes(target)) throw new HttpError(400, 'Ungültiges Bildziel.');
        const file = form.get('image');
        if (!file || typeof file === 'string' || !file.size) throw new HttpError(400, 'Bitte ein Bild auswählen.');
        if (file.size > 2 * 1024 * 1024) throw new HttpError(413, 'Das Bild darf maximal 2 MB groß sein.');
        const imageBytes = new Uint8Array(await file.arrayBuffer());
        const type = imageType(imageBytes);
        if (!type || type !== file.type) throw new HttpError(400, 'Bitte ein JPEG-, PNG- oder WebP-Bild auswählen.');
        const id = crypto.randomUUID();
        const imagePath = '/api/images/' + id;
        let binary = '';
        for (let offset = 0; offset < imageBytes.length; offset += 8192) binary += String.fromCharCode(...imageBytes.subarray(offset, offset + 8192));
        await sql.transaction([
          sql`INSERT INTO site_image (id, media_type, data_base64) VALUES (${id}, ${type}, ${btoa(binary)})`,
          ...(target === 'library' ? [] : [sql`INSERT INTO site_setting (setting_key, setting_value) VALUES (${target}, ${imagePath}) ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`]),
        ]);
        return json({ path: imagePath }, 201);
      }
    }
    if (path === '/api/content' && method === 'GET') return json(publicContent(await content(sql, env)));
    if (path === '/api/courses' && method === 'GET') {
      const values = await content(sql, env);
      return json((await sql`SELECT * FROM course WHERE published = true ORDER BY sort_order, id`).map(row => ({ ...courseColumns(row), bookingUrl: row.booking_url || values.bookingUrl })));
    }
    const courseMatch = path.match(/^\/api\/courses\/([^/]+)$/);
    if (courseMatch && method === 'GET') {
      const [row] = await sql`SELECT * FROM course WHERE slug = ${decodeURIComponent(courseMatch[1])} AND published = true`;
      if (!row) throw new HttpError(404, 'Angebot nicht gefunden.');
      const values = await content(sql, env);
      return json({ ...courseColumns(row), bookingUrl: row.booking_url || values.bookingUrl });
    }
    const imageMatch = path.match(/^\/api\/images\/([a-f0-9-]{36})$/);
    if (imageMatch && method === 'GET') {
      const [row] = await sql`SELECT media_type, data_base64 FROM site_image WHERE id = ${imageMatch[1]}`;
      if (!row) throw new HttpError(404, 'Bild nicht gefunden.');
      return new Response(Uint8Array.from(atob(row.data_base64), c => c.charCodeAt(0)), { headers: {
        'Content-Type': row.media_type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff',
      } });
    }
    if (path === '/api/contact' && method === 'POST') {
      await rateLimit(request, sql, 'contact', 5);
      const data = validateContact(await readJson(request));
      if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !env.CONTACT_EMAIL) throw new HttpError(503, 'Das Kontaktformular ist derzeit nicht verfügbar. Bitte später erneut versuchen.');
      const response = await fetchEmail('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ from: env.CONTACT_FROM, to: [env.CONTACT_EMAIL], reply_to: data.email, subject: 'Kontakt: ' + data.subject, text: `Von: ${data.name} <${data.email}>\n\n${data.message}` }),
      });
      if (!response.ok) throw new HttpError(502, 'Die Nachricht konnte nicht versendet werden. Bitte später erneut versuchen.');
      return json({ message: 'Nachricht versendet.' });
    }
    throw new HttpError(404, 'Endpunkt nicht gefunden.');
  } catch (error) {
    if (error instanceof HttpError) return json({ message: error.message }, error.status, error.status === 429 ? { 'Retry-After': '900' } : {});
    if (error.code === '23505') return json({ message: 'Dieses URL-Kürzel ist bereits vergeben.' }, 409);
    if (error.code === '23503') return json({ message: 'Der Kurs besitzt bestehende Buchungen und kann nicht gelöscht werden.' }, 409);
    // Do not expose SQL, credentials or submitted personal data in responses/logs.
    console.error('API request failed', error.name, error.code || 'unavailable');
    return json({ message: 'Die Anfrage konnte nicht verarbeitet werden. Bitte später erneut versuchen.' }, 503);
  }
}
