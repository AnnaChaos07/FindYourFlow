import { test, expect } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { handleApi } from '../../lib/api.js';
import { hashPassword } from '../../lib/auth.js';

let db;
const password = 'browser-test-password-123';
test.beforeEach(async ({ page }) => {
  db = new PGlite();
  for (const file of ['001_schema.sql', '003_cms.sql', '002_seed.sql']) await db.exec(await readFile(new URL('../../database/' + file, import.meta.url), 'utf8'));
  const sql = (strings, ...values) => {
    const text = strings.reduce((text, part, i) => text + (i ? '$' + i : '') + part, '');
    return { text, values, then(resolve, reject) { return db.query(text, values).then(result => result.rows).then(resolve, reject); } };
  };
  sql.transaction = queries => db.transaction(async tx => {
    const rows = [];
    for (const query of queries) rows.push((await tx.query(query.text, query.values)).rows);
    return rows;
  });
  const env = { ADMIN_PASSWORD_HASH: await hashPassword(password), RESEND_API_KEY: 'test-only', CONTACT_FROM: 'sender@example.com', CONTACT_EMAIL: 'anna@example.com' };
  await page.route('**/api/**', async route => {
    const incoming = route.request();
    const request = new Request(incoming.url(), { method: incoming.method(), headers: incoming.headers(), body: incoming.postDataBuffer() || undefined });
    const response = await handleApi(request, env, sql, async () => new Response('{}'));
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
});
test.afterEach(async () => { await db?.close(); });
async function login(page) {
  await page.goto('/admin/');
  await page.getByLabel('Passwort', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Website verwalten' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Bereich auswählen' })).toBeVisible();
}

test('edit homepage, publish a custom page, preview it and add a footer link', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await login(page);
  await page.getByRole('combobox', { name: 'Bereich auswählen' }).selectOption('Startseite');
  await page.getByLabel('Überschrift', { exact: true }).fill('Finde deinen Flow');
  await page.getByRole('button', { name: 'Diesen Bereich speichern' }).click();
  await expect(page.getByRole('button', { name: 'Diesen Bereich speichern' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Zusätzliche Seiten' }).click();
  await page.getByRole('button', { name: 'Seite hinzufügen' }).click();
  await page.getByLabel('Seitentitel', { exact: true }).fill('Fragen und Antworten');
  await page.getByLabel('URL-Kürzel', { exact: true }).fill('faq');
  await page.getByLabel('Veröffentlicht (nach dem Speichern öffentlich erreichbar)').check();
  await page.getByRole('button', { name: 'Abschnitt hinzufügen' }).click();
  await page.getByLabel('Überschrift', { exact: true }).last().fill('Was brauche ich?');
  await page.getByLabel('Text', { exact: true }).fill('Eine Matte.\n<strong>Kein HTML</strong>');
  await page.getByRole('button', { name: 'Vorschau der Änderungen' }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Fragen und Antworten' })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('<strong>Kein HTML</strong>', { exact: false })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Seiten speichern', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Seiten speichern', exact: true })).toBeDisabled();
  await page.getByRole('tab', { name: 'Menüs', exact: true }).click();
  const footer = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Fußmenü', exact: true }) });
  await footer.getByRole('button', { name: 'Menüpunkt hinzufügen' }).click();
  await footer.getByLabel('Beschriftung', { exact: true }).fill('Häufige Fragen');
  await footer.getByRole('combobox', { name: 'Vorhandene Seite als Linkziel auswählen' }).selectOption('/seite/?slug=faq');
  await footer.getByRole('button', { name: 'Fußmenü speichern' }).click();
  await expect(footer.getByRole('button', { name: 'Fußmenü speichern' })).toBeDisabled();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Finde deinen Flow' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buchen', exact: true })).toHaveAttribute('href', 'https://find-your-flow.purpleslot.io/');
  await page.locator('footer').getByRole('link', { name: 'Häufige Fragen' }).click();
  await expect(page.getByRole('heading', { name: 'Fragen und Antworten' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Was brauche ich?' })).toBeVisible();
  await expect(page).toHaveTitle('Fragen und Antworten | Yoga mit Anna');
  await page.screenshot({ path: 'test-results/custom-page.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('tab changes retain drafts and unpublished courses disappear publicly', async ({ page }) => {
  await login(page);
  await page.getByLabel('Name der Website', { exact: true }).fill('Entwurf der Marke');
  await page.getByRole('tab', { name: 'Kurse', exact: true }).click();
  await page.getByRole('button', { name: 'Bearbeiten', exact: true }).first().click();
  await page.getByLabel('Veröffentlicht', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Kurs speichern', exact: true }).click();
  await expect(page.getByText('Kurs gespeichert.', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Texte & Bilder', exact: true }).click();
  await expect(page.getByLabel('Name der Website', { exact: true })).toHaveValue('Entwurf der Marke');
  await page.getByRole('button', { name: 'Diesen Bereich speichern' }).click();
  await expect(page.getByRole('button', { name: 'Diesen Bereich speichern' })).toBeDisabled();
  await page.screenshot({ path: 'test-results/admin-panel.png', fullPage: true });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Entwurf der Marke', exact: true })).toBeVisible();
  await expect(page.getByText('Präventionskurse', { exact: true })).toHaveCount(0);
  await page.goto('/angebote/?slug=praeventionskurse');
  await expect(page.getByText('Dieses Angebot ist nicht verfügbar.')).toBeVisible();
});

test('contact labels are editable and successful submission clears the form', async ({ page }) => {
  await login(page);
  await page.getByRole('combobox', { name: 'Bereich auswählen' }).selectOption('Kontaktformular');
  await page.getByLabel('Überschrift', { exact: true }).fill('Schreib uns');
  await page.getByLabel('Feld: Name', { exact: true }).fill('Dein Name');
  await page.getByLabel('Erfolgsnachricht', { exact: true }).fill('Danke für deine Nachricht!');
  await page.getByRole('button', { name: 'Diesen Bereich speichern' }).click();
  await expect(page.getByRole('button', { name: 'Diesen Bereich speichern' })).toBeDisabled();
  await page.goto('/kontakt/');
  await expect(page.getByRole('heading', { name: 'Schreib uns' })).toBeVisible();
  await page.getByLabel('Dein Name', { exact: true }).fill('Test');
  await page.getByLabel('E-Mail', { exact: true }).fill('test@example.com');
  await page.getByLabel('Betreff', { exact: true }).fill('Frage');
  await page.getByLabel('Nachricht', { exact: true }).fill('Hallo Anna!');
  await page.getByRole('button', { name: 'Nachricht senden' }).click();
  await expect(page.getByText('Danke für deine Nachricht!')).toBeVisible();
  await expect(page.getByLabel('Dein Name', { exact: true })).toHaveValue('');
});
