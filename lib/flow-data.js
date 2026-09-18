// Shared by home, offer pages and dates. No network writes or production fixtures.
export function parseCollection(value) {
  try { const data = JSON.parse(value || '[]'); return Array.isArray(data) ? data : []; } catch { return []; }
}
export function upcomingEvents(events, { category, limit = Infinity, now = new Date() } = {}) {
  return events.filter(event => event.published && (!category || event.category === category) && Number.isFinite(Date.parse(event.start)) && Date.parse(event.end || event.start) >= now.getTime())
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start)).slice(0, limit);
}
