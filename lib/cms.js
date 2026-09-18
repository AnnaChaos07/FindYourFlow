import { contentGroups, defaults } from './content.js';
import { HttpError, bookingUrl, requireText } from './validation.js';

const invalid = message => { throw new HttpError(400, message); };
export function safeLink(value, { image = false } = {}) {
  if (value === '') return '';
  if (typeof value !== 'string' || value.length > 2000 || /[\u0000-\u0020\\]/.test(value)) invalid('Bitte eine gültige Linkadresse ohne Leerzeichen angeben.');
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  if (!image && /^#[a-zA-Z0-9_-]+$/.test(value)) return value;
  if (!image && (/^mailto:[^\s@?]+@[^\s@?]+$/.test(value) || /^tel:\+?[0-9()-]+$/.test(value))) return value;
  let url;
  try { url = new URL(value); } catch { invalid('Links müssen mit /, https://, mailto: oder tel: beginnen.'); }
  if (url.protocol !== 'https:' || url.username || url.password) invalid('Externe Links müssen HTTPS verwenden.');
  return url.href;
}
function optionalText(value, label, max = 10000) {
  if (typeof value !== 'string' || value.length > max) invalid(`${label}: Maximal ${max} Zeichen erlaubt.`);
  return value.trim();
}
function boolean(value, fallback = true) {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') invalid('Ungültiger Sichtbarkeitswert.');
  return value;
}
function identifier(value) { return requireText(value, 'ID', 80); }
export function validateMenu(items, depth = 0, ids = new Set()) {
  if (!Array.isArray(items) || items.length > 30) invalid('Maximal 30 Menüpunkte je Ebene erlaubt.');
  return items.map(item => {
    if (!item || typeof item !== 'object') invalid('Ungültiger Menüpunkt.');
    const id = identifier(item.id);
    if (ids.has(id)) invalid('Menüpunkte benötigen eindeutige IDs.');
    ids.add(id);
    const type = item.type || 'link';
    if (!(depth ? ['link', 'booking'] : ['link', 'booking', 'group', 'courses']).includes(type)) invalid('Ungültiger Menütyp.');
    const href = type === 'link' ? safeLink(item.href) : '';
    if (type === 'link' && !href) invalid('Bitte ein Ziel für den Menüpunkt angeben.');
    const children = type === 'group' ? validateMenu(item.children || [], depth + 1, ids) : [];
    if (type === 'group' && !children.length) invalid('Eine Menügruppe benötigt mindestens einen Unterpunkt.');
    return { id, type, label: requireText(item.label, 'Menübeschriftung', 100), href, children, visible: boolean(item.visible), newTab: boolean(item.newTab, false) };
  });
}
export function validatePages(pages) {
  if (!Array.isArray(pages) || pages.length > 50) invalid('Maximal 50 zusätzliche Seiten erlaubt.');
  const ids = new Set(), slugs = new Set();
  return pages.map(page => {
    if (!page || typeof page !== 'object') invalid('Ungültige Seite.');
    const id = identifier(page.id), slug = requireText(page.slug, 'Seitenkürzel', 80);
    if (ids.has(id) || slugs.has(slug)) invalid('Seiten-IDs und Seitenkürzel müssen eindeutig sein.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) invalid('Seitenkürzel: Nur Kleinbuchstaben, Zahlen und Bindestriche verwenden.');
    ids.add(id); slugs.add(slug);
    if (!Array.isArray(page.sections) || page.sections.length > 30) invalid('Maximal 30 Abschnitte pro Seite erlaubt.');
    const sectionIds = new Set();
    const sections = page.sections.map(section => {
      if (!section || typeof section !== 'object') invalid('Ungültiger Abschnitt.');
      const id = identifier(section.id);
      if (sectionIds.has(id)) invalid('Abschnitte benötigen eindeutige IDs.');
      sectionIds.add(id);
      const result = { id };
      for (const key of ['title', 'body', 'imageAlt', 'buttonLabel']) result[key] = optionalText(section[key] ?? '', 'Abschnitt ' + key, key === 'body' ? 20000 : 300);
      result.image = safeLink(section.image || '', { image: true });
      result.buttonHref = safeLink(section.buttonHref || '');
      if (Boolean(result.buttonLabel) !== Boolean(result.buttonHref)) invalid('Eine Abschnitt-Schaltfläche benötigt Beschriftung und Ziel.');
      return result;
    });
    return { id, slug, title: requireText(page.title, 'Seitentitel', 200), eyebrow: optionalText(page.eyebrow ?? '', 'Dachzeile', 200), intro: optionalText(page.intro ?? '', 'Einleitung'), description: optionalText(page.description ?? '', 'Seitenbeschreibung', 500), published: boolean(page.published, false), sections };
  });
}
export function validateContent(data) {
  const updates = [];
  for (const [key, label, , type] of contentGroups.flatMap(group => group.fields)) {
    if (!(key in data)) continue;
    let value = optionalText(data[key], label, ['events','testimonials','classes'].includes(type) ? 200000 : 10000);
    if (['events','testimonials','classes'].includes(type)) value = validateCollection(value, type);
    if (key === 'publicEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) invalid('Bitte eine gültige öffentliche E-Mail eingeben.');
    if (type === 'calendly' && value) {
      value = safeLink(value);
      const url = new URL(value, 'https://site.invalid');
      if (url.protocol !== 'https:' || url.hostname !== 'calendly.com') invalid('Bitte einen HTTPS-Link von calendly.com angeben.');
    }
    if (type === 'booking') value = bookingUrl(value);
    if (type === 'link' || type === 'image') value = safeLink(value, { image: type === 'image' });
    updates.push([key, value]);
  }
  for (const key of ['navigation', 'footerNavigation', 'pages']) {
    if (key in data) updates.push([key, JSON.stringify(key === 'pages' ? validatePages(data[key]) : validateMenu(data[key]))]);
  }
  return updates;
}
export function decodeContent(rows, env = {}) {
  const values = { ...defaults, bookingUrl: env.PURPLE_SLOT_BOOKING_URL ? bookingUrl(env.PURPLE_SLOT_BOOKING_URL) : defaults.bookingUrl };
  for (const { setting_key: key, setting_value: value } of rows) {
    if (!Object.hasOwn(defaults, key)) continue;
    values[key] = ['navigation', 'footerNavigation', 'pages'].includes(key) ? JSON.parse(value) : value;
  }
  return values;
}
export function publicContent(values) {
  const pages = values.pages.filter(page => page.published);
  const liveSlugs = new Set(pages.map(page => page.slug));
  function menu(items) {
    return items.filter(item => item.visible).flatMap(item => {
      if (item.type === 'link' && item.href.startsWith('/') && new URL(item.href, 'https://site.invalid').pathname.replace(/\/$/, '') === '/seite') {
        const slug = new URL(item.href, 'https://site.invalid').searchParams.get('slug');
        if (!liveSlugs.has(slug)) return [];
      }
      if (item.type === 'group') {
        const children = menu(item.children);
        return children.length ? [{ ...item, children }] : [];
      }
      return [item];
    });
  }
  const collections = Object.fromEntries(['eventsJson','testimonialsJson','classesJson'].map(key => { let rows; try { rows=JSON.parse(values[key] || '[]'); } catch { rows=[]; } return [key, JSON.stringify(Array.isArray(rows) ? rows.filter(row => row.published) : [])]; }));
  return { ...values, ...collections, pages, navigation: menu(values.navigation), footerNavigation: menu(values.footerNavigation) };
}

// Structured collections reuse site_setting; no schema migration or seed is needed.
export function validateCollection(value, type) {
  let rows;
  try { rows = JSON.parse(value); } catch { invalid('Bitte gültiges JSON eingeben.'); }
  if (!Array.isArray(rows) || rows.length > 100) invalid('Maximal 100 Einträge erlaubt.');
  const ids = new Set();
  return JSON.stringify(rows.map(row => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) invalid('Ungültiger Eintrag.');
    if (row.mock || row.developmentOnly || String(row.id || '').startsWith('fixture-')) invalid('Entwicklungs-Fixtures dürfen nicht im CMS gespeichert werden.');
    const id = identifier(row.id); if (ids.has(id)) invalid('IDs müssen eindeutig sein.'); ids.add(id);
    const result = { id, published: boolean(row.published, false) };
    const text = (key, max = 500) => requireText(row[key], key, max);
    const optional = (key, max = 500) => optionalText(row[key] || '', key, max);
    const translatedFields = type === 'testimonials' ? [['quote',5000],['context',200]] : type === 'classes' ? [['title',200],['day',30],['description',1000],['bookingLabel',100]] : [['title',200],['duration',100],['theme',300]];
    for (const [key,max] of translatedFields) if (row[key + 'En']) result[key + 'En'] = optional(key + 'En', max);
    if (type === 'testimonials') {
      if (!Array.isArray(row.contexts) || row.contexts.length > 20 || row.contexts.some(v => typeof v !== 'string' || !/^[a-z-]{1,80}$/.test(v))) invalid('Ungültige Testimonial-Kontexte.');
      return { ...result, name: text('name',100), quote: text('quote',5000), context: text('context',200), contexts: row.contexts };
    }
    result.title = text('title',200); result.bookingUrl = safeLink(row.bookingUrl || '');
    if (result.bookingUrl && !result.bookingUrl.startsWith('https://')) invalid('Buchungen benötigen einen HTTPS-Link.');
    result.location = text('location',300);
    if (type === 'classes') {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(row.time || '')) invalid('Uhrzeit im Format HH:MM eingeben.');
      return { ...result, day: text('day',30), time: row.time, description: text('description',1000), bookingLabel: optional('bookingLabel',100) };
    }
    const timestamp = key => {
      const value = row[key];
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) invalid('Termine benötigen ein ISO-Datum mit Jahr und Zeitzone.');
      return value;
    };
    const start = timestamp('start'), end = row.end ? timestamp('end') : '';
    if (end && Date.parse(end) < Date.parse(start)) invalid('Das Ende darf nicht vor dem Beginn liegen.');
    if (!/^[a-z0-9-]{1,80}$/.test(row.category || '')) invalid('Ungültige Terminkategorie.');
    if (typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price < 0 || row.price > 100000) invalid('Ungültiger Preis.');
    return { ...result, start, end, category: row.category, price: row.price, duration: text('duration',100), theme: optional('theme',300) };
  }));
}
