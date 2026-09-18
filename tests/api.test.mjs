import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { handleApi } from '../lib/api.js';
import { hashPassword, digest } from '../lib/auth.js';
import { bookingUrl } from '../lib/validation.js';

let db, sql, env;
const origin = 'https://anna.example';
const password = 'test-password-with-sufficient-length';
const course = { title: 'Neuer Kurs', slug: 'neuer-kurs', teaser: 'Beschreibung', duration: '60 Minuten', price: '20.50', bookingUrl: 'https://app.purpleslot.io/studio/example' };
function request(path, method = 'GET', body, cookie, extra = {}) {
  const headers = { Origin: origin, 'CF-Connecting-IP': '192.0.2.1', ...extra };
  if (cookie) headers.Cookie = cookie;
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  return new Request(origin + '/api' + path, { method, headers, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
}
const call = (path, method, body, cookie, extra) => handleApi(request(path, method, body, cookie, extra), env, sql);
async function login() {
  const response = await call('/admin/login', 'POST', { password });
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}

before(async () => {
  db = new PGlite();
  // Match Neon's lazy query/transaction contract while executing real PostgreSQL.
  sql = (strings, ...values) => {
    const text = strings.reduce((text, part, i) => text + (i ? '$' + i : '') + part, '');
    return { text, values, then(resolve, reject) { return db.query(text, values).then(result => result.rows).then(resolve, reject); } };
  };
  sql.transaction = queries => db.transaction(async tx => {
    const results = [];
    for (const query of queries) results.push((await tx.query(query.text, query.values)).rows);
    return results;
  });
  const schema = await readFile(new URL('../database/001_schema.sql', import.meta.url), 'utf8');
  await db.exec(schema);
  await db.exec(await readFile(new URL('../database/002_seed.sql', import.meta.url), 'utf8'));
  await db.exec(schema);
  await db.exec(await readFile(new URL('../database/003_cms.sql', import.meta.url), 'utf8'));
  env = { ADMIN_PASSWORD_HASH: await hashPassword(password) };
});
beforeEach(async () => { await db.exec('TRUNCATE admin_session, request_limit'); });
after(async () => { await db.close(); });

test('schema is repeatable; public courses and content keep the existing contract', async () => {
  const response = await call('/courses');
  assert.equal(response.status, 200);
  const courses = await response.json();
  assert.equal(courses.length, 5);
  assert.equal(courses[0].price, '129.00');
  assert.equal((await (await call('/content')).json()).heroTitle, 'Dein Körper.\nDein Rhythmus.\nDein Weg.');
  assert.equal((await call('/courses/missing')).status, 404);
  assert.equal((await call('/bookings', 'POST', {})).status, 410);
});

test('protected mutations reject missing sessions and foreign origins', async () => {
  assert.equal((await call('/admin/courses', 'POST', course)).status, 401);
  assert.equal((await call('/admin/login', 'POST', { password }, null, { Origin: 'https://attacker.example' })).status, 403);
  assert.equal((await handleApi(request('/courses'), {}, null)).status, 503);
  const malformed = new Request(origin + '/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handleApi(malformed, env, sql)).status, 400);
});

test('sessions use secure cookies and hashed tokens, expire and can be revoked', async () => {
  const response = await call('/admin/login', 'POST', { password });
  const header = response.headers.get('set-cookie');
  assert.match(header, /HttpOnly/);
  assert.match(header, /SameSite=Strict/);
  assert.match(header, /Secure/);
  const cookie = header.split(';')[0];
  const [row] = await sql`SELECT token_hash FROM admin_session`;
  assert.equal(row.token_hash, await digest(cookie.split('=')[1]));
  assert.equal((await (await call('/admin/status', 'GET', undefined, cookie)).json()).authenticated, true);
  await db.exec("UPDATE admin_session SET expires_at = now() - interval '1 second'");
  assert.equal((await call('/admin/courses', 'GET', undefined, cookie)).status, 401);
  const fresh = await login();
  assert.equal((await call('/admin/logout', 'POST', undefined, fresh)).status, 200);
  assert.equal((await call('/admin/courses', 'GET', undefined, fresh)).status, 401);
});

test('login attempts are limited even when workers share only PostgreSQL', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await call('/admin/login', 'POST', { password: 'wrong' })).status, 403);
  const response = await call('/admin/login', 'POST', { password });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '900');
});

test('course CRUD validates data, detects duplicate slugs and preserves historical bookings', async () => {
  const cookie = await login();
  assert.equal((await call('/admin/courses', 'POST', { ...course, price: '-1' }, cookie)).status, 400);
  const response = await call('/admin/courses', 'POST', course, cookie);
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.equal((await call('/admin/courses', 'POST', course, cookie)).status, 409);
  assert.equal((await call('/admin/courses/' + created.id, 'PUT', { ...course, price: '25.00' }, cookie)).status, 200);
  assert.equal((await (await call('/courses/neuer-kurs')).json()).price, '25.00');
  assert.equal((await call('/admin/courses/' + created.id, 'DELETE', undefined, cookie)).status, 204);
  assert.equal((await call('/courses/neuer-kurs')).status, 404);
  await sql`INSERT INTO booking (course_id, customer_name, customer_email, paypal_order_id, status, created_at) VALUES (1, 'Test', 'test@example.com', 'historical', 'paid', now())`;
  assert.equal((await call('/admin/courses/1', 'DELETE', undefined, cookie)).status, 409);
  assert.equal((await sql`SELECT * FROM booking`).length, 1);
});

test('site settings support studio links and reject unsafe booking destinations', async () => {
  const cookie = await login();
  for (const url of ['javascript:alert(1)', 'https://purpleslot.io.evil.example', 'https://user:pass@purpleslot.io', 'http://purpleslot.io']) assert.throws(() => bookingUrl(url));
  const response = await call('/admin/content', 'PUT', { heroTitle: 'Neue Überschrift', bookingUrl: 'https://booking.purpleslot.io/studio/anna', heroImage: '/images/anna-yoga.png' }, cookie);
  assert.equal(response.status, 200);
  const settings = await response.json();
  assert.equal(settings.heroTitle, 'Neue Überschrift');
  assert.equal(settings.heroImage, '/images/anna-yoga.png');
  assert.equal((await (await call('/courses/offene-stunden')).json()).bookingUrl, settings.bookingUrl);
  assert.equal((await call('/admin/content', 'PUT', { bookingUrl: 'https://evil.example' }, cookie)).status, 400);
});

test('image upload persists bytes and rejects SVG and oversized requests', async () => {
  const cookie = await login();
  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2lWQAAAAASUVORK5CYII=', 'base64'));
  const form = new FormData();
  form.set('image', new Blob([png], { type: 'image/png' }), 'pixel.png');
  const response = await call('/admin/image', 'POST', form, cookie);
  assert.equal(response.status, 201);
  const { path } = await response.json();
  const image = await handleApi(new Request(origin + path), env, sql);
  assert.equal(image.headers.get('content-type'), 'image/png');
  assert.deepEqual(new Uint8Array(await image.arrayBuffer()), png);
  const invalid = new FormData();
  invalid.set('image', new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/svg+xml' }), 'bad.svg');
  assert.equal((await call('/admin/image', 'POST', invalid, cookie)).status, 400);
  const oversized = new FormData();
  oversized.set('image', new Blob([new Uint8Array(2 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
  assert.equal((await call('/admin/image', 'POST', oversized, cookie)).status, 413);
});

test('contact only reports success after provider acceptance and never leaks configuration', async () => {
  const message = { name: 'Anna', email: 'sender@example.com', subject: 'Frage', message: 'Hallo!', privacyConsent: true };
  assert.equal((await call('/contact', 'POST', { ...message, email: 'invalid' })).status, 400);
  assert.equal((await call('/contact', 'POST', message)).status, 503);
  const emailEnv = { ...env, RESEND_API_KEY: 'secret-test', CONTACT_FROM: 'website@example.com', CONTACT_EMAIL: 'anna@example.com' };
  let sent;
  const accepted = await handleApi(request('/contact', 'POST', message), emailEnv, sql, async (url, options) => { sent = { url, ...JSON.parse(options.body) }; return new Response('{}', { status: 200 }); });
  assert.equal(accepted.status, 200);
  assert.equal(sent.reply_to, message.email);
  assert.equal(sent.from, emailEnv.CONTACT_FROM);
  const failed = await handleApi(request('/contact', 'POST', message), emailEnv, sql, async () => new Response('secret-test', { status: 500 }));
  assert.equal(failed.status, 502);
  assert.doesNotMatch(await failed.text(), /secret-test/);
});

test('CMS migration installs the supplied studio link and preserves a configured link', async () => {
  const migration = await readFile(new URL('../database/003_cms.sql', import.meta.url), 'utf8');
  await sql`DELETE FROM site_setting WHERE setting_key = 'bookingUrl'`;
  await db.exec(migration);
  assert.equal((await (await call('/content')).json()).bookingUrl, 'https://find-your-flow.purpleslot.io/');
  await sql`UPDATE site_setting SET setting_value = 'https://other.purpleslot.io/' WHERE setting_key = 'bookingUrl'`;
  await db.exec(migration);
  assert.equal((await (await call('/content')).json()).bookingUrl, 'https://other.purpleslot.io/');
});

test('all public text groups are saved independently and unsafe URLs roll back the whole change', async () => {
  const cookie = await login();
  const response = await call('/admin/content', 'PUT', { heroEyebrow: 'Neue Dachzeile', contactNameLabel: 'Dein Name', footerText: '© {year} Find Your Flow', heroButtonHref: 'https://find-your-flow.purpleslot.io/' }, cookie);
  assert.equal(response.status, 200);
  const current = await (await call('/content')).json();
  assert.equal(current.heroEyebrow, 'Neue Dachzeile');
  assert.equal(current.contactNameLabel, 'Dein Name');
  assert.equal(current.footerText, '© {year} Find Your Flow');
  const failed = await call('/admin/content', 'PUT', { heroEyebrow: 'Must not save', heroImage: 'javascript:alert(1)' }, cookie);
  assert.equal(failed.status, 400);
  assert.equal((await (await call('/content')).json()).heroEyebrow, 'Neue Dachzeile');
  for (const value of ['//evil.example', '/\\evil.example', 'data:text/html,test', 'https://user:password@example.com']) {
    assert.equal((await call('/admin/content', 'PUT', { heroButtonHref: value }, cookie)).status, 400);
  }
});

test('custom page drafts remain private; menus filter draft targets and keep ordering', async () => {
  const cookie = await login();
  const section = { id: 'intro', title: 'Willkommen', body: '<script>literal text</script>\nZweiter Absatz', image: '', imageAlt: '', buttonLabel: 'Buchen', buttonHref: 'https://find-your-flow.purpleslot.io/' };
  const pages = [
    { id: 'faq', slug: 'faq', title: 'Fragen', intro: 'Antworten', published: true, sections: [section] },
    { id: 'private', slug: 'intern', title: 'Geheime Entwurfsseite', published: false, sections: [] },
  ];
  const link = (id, href, visible = true) => ({ id, label: id, type: 'link', href, visible });
  const navigation = [link('contact', '/kontakt/'), { id: 'group', type: 'group', label: 'Informationen', visible: true, children: [link('faq-link', '/seite/?slug=faq'), link('draft-link', '/seite/?slug=intern')] }, link('hidden', '/', false)];
  assert.equal((await call('/admin/content', 'PUT', { pages, navigation }, cookie)).status, 200);
  const publicData = await (await call('/content')).json();
  assert.deepEqual(publicData.pages.map(page => page.slug), ['faq']);
  assert.doesNotMatch(JSON.stringify(publicData), /Geheime Entwurfsseite/);
  assert.deepEqual(publicData.navigation.map(item => item.id), ['contact', 'group']);
  assert.equal(publicData.navigation[1].children.length, 1);
  assert.equal((await (await call('/admin/content', 'GET', undefined, cookie)).json()).pages.length, 2);
  pages[1].published = true;
  await call('/admin/content', 'PUT', { pages }, cookie);
  assert.equal((await (await call('/content')).json()).pages.length, 2);
  pages[0].published = false;
  await call('/admin/content', 'PUT', { pages }, cookie);
  assert.equal((await (await call('/content')).json()).navigation[1].children[0].id, 'draft-link');
});

test('CMS validates duplicate pages, nested menus and payload size', async () => {
  const cookie = await login();
  const page = { id: 'duplicate', slug: 'duplicate', title: 'Test', sections: [] };
  assert.equal((await call('/admin/content', 'PUT', { pages: [page, page] }, cookie)).status, 400);
  assert.equal((await call('/admin/content', 'PUT', { navigation: [{ id: 'bad', type: 'group', label: 'Leer', children: [] }] }, cookie)).status, 400);
  assert.equal((await call('/admin/content', 'PUT', { pages: [{ ...page, sections: [{ id: 'bad', buttonHref: 'javascript:alert(1)' }] }] }, cookie)).status, 400);
  const largePage = { ...page, sections: [{ id: 'long', body: 'x'.repeat(19000) }, { id: 'long2', body: 'x'.repeat(19000) }] };
  assert.equal((await call('/admin/content', 'PUT', { pages: [largePage] }, cookie)).status, 200);
  assert.equal((await call('/admin/content', 'PUT', { heroText: 'x'.repeat(1024 * 1024 + 1) }, cookie)).status, 413);
});

test('draft courses are private and published courses follow configured ordering', async () => {
  const cookie = await login();
  const response = await call('/admin/courses', 'POST', { ...course, slug: 'draft-course', published: false, description: 'Nur intern', sortOrder: 12 }, cookie);
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.equal((await call('/courses/draft-course')).status, 404);
  assert.equal((await (await call('/courses')).json()).some(item => item.slug === 'draft-course'), false);
  assert.equal((await (await call('/admin/courses', 'GET', undefined, cookie)).json()).some(item => item.slug === 'draft-course'), true);
  await call('/admin/courses/' + created.id, 'PUT', { ...course, slug: 'draft-course', published: true, description: 'Jetzt öffentlich', sortOrder: 99 }, cookie);
  const list = await (await call('/courses')).json();
  assert.equal(list.at(-1).slug, 'draft-course');
  assert.equal(list.at(-1).description, 'Jetzt öffentlich');
  assert.equal((await call('/admin/courses/' + created.id, 'PUT', { ...course, sortOrder: 1.5 }, cookie)).status, 400);
});

test('media library uploads do not change the homepage and require authentication', async () => {
  const cookie = await login();
  const before = await (await call('/content')).json();
  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2lWQAAAAASUVORK5CYII=', 'base64'));
  const form = new FormData();
  form.set('image', new Blob([png], { type: 'image/png' }), 'pixel.png');
  form.set('target', 'library');
  const response = await call('/admin/image', 'POST', form, cookie);
  assert.equal(response.status, 201);
  assert.equal((await (await call('/content')).json()).heroImage, before.heroImage);
  assert.equal((await call('/admin/images')).status, 401);
  const images = await (await call('/admin/images', 'GET', undefined, cookie)).json();
  assert.ok(images.some(image => image.path === (before.heroImage)));
  assert.equal(images[0].mediaType, 'image/png');
});
