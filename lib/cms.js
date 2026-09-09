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
    let value = optionalText(data[key], label);
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
  return { ...values, pages, navigation: menu(values.navigation), footerNavigation: menu(values.footerNavigation) };
}
