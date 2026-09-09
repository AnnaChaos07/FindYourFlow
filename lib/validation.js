export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function requireText(value, label, max) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new HttpError(400, `${label}: Bitte einen gültigen Wert mit maximal ${max} Zeichen eingeben.`);
  }
  return value.trim();
}
export function bookingUrl(value) {
  if (value === undefined || value === null || value === '') return '';
  let url;
  try { url = new URL(value); } catch { throw new HttpError(400, 'Bitte einen gültigen Purple-Slot-Link angeben.'); }
  if (typeof value !== 'string' || value.length > 2000 || url.protocol !== 'https:' || url.username || url.password || url.port ||
      !(url.hostname === 'purpleslot.io' || url.hostname.endsWith('.purpleslot.io'))) {
    throw new HttpError(400, 'Buchungslinks müssen HTTPS-Adressen von Purple Slot sein.');
  }
  return url.href;
}
export function validateCourse(data) {
  const title = requireText(data.title, 'Titel', 160);
  const slug = requireText(data.slug || title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), 'URL-Kürzel', 80);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new HttpError(400, 'Das URL-Kürzel darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten.');
  const price = String(data.price ?? '');
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(price)) throw new HttpError(400, 'Bitte einen gültigen, nicht negativen Preis eingeben.');
  const description = data.description ?? '';
  if (typeof description !== 'string' || description.length > 20000) throw new HttpError(400, 'Die Kursbeschreibung darf maximal 20000 Zeichen enthalten.');
  const published = data.published ?? true;
  if (typeof published !== 'boolean') throw new HttpError(400, 'Ungültiger Veröffentlichungsstatus.');
  const sortOrder = Number(data.sortOrder ?? 0);
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) throw new HttpError(400, 'Die Sortierung muss eine ganze Zahl zwischen 0 und 100000 sein.');
  return { description: description.trim(), published, sortOrder, title, slug, teaser: requireText(data.teaser, 'Beschreibung', 500), duration: requireText(data.duration, 'Dauer', 80), price, bookingUrl: bookingUrl(data.bookingUrl) };
}
export function validateContact(data) {
  const email = requireText(data.email, 'E-Mail', 180);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Bitte eine gültige E-Mail-Adresse eingeben.');
  return { name: requireText(data.name, 'Name', 120), email, subject: requireText(data.subject, 'Betreff', 200), message: requireText(data.message, 'Nachricht', 10000) };
}
export async function readBody(request, maxBytes = 24000) {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new HttpError(413, 'Die Anfrage ist zu groß.');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > maxBytes) { await reader.cancel(); throw new HttpError(413, 'Die Anfrage ist zu groß.'); }
    chunks.push(value);
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
export async function readJson(request, maxBytes = 24000) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415, 'JSON erwartet.');
  const bytes = await readBody(request, maxBytes);
  let data;
  try { data = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new HttpError(400, 'Ungültiges JSON.'); }
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new HttpError(400, 'Ein JSON-Objekt wird erwartet.');
  return data;
}
export function imageType(bytes) {
  if (bytes.length < 12) return null;
  if ([137,80,78,71,13,10,26,10].every((b, i) => bytes[i] === b)) return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  const text = new TextDecoder();
  if (text.decode(bytes.slice(0,4)) === 'RIFF' && text.decode(bytes.slice(8,12)) === 'WEBP') return 'image/webp';
  return null;
}
