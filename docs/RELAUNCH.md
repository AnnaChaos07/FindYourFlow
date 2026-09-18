# Find Your Flow – Relaunch

## Architektur und Hosting

Unverändert: Next.js App Router → `next build --webpack` → statischer Export `out/`; Cloudflare Pages liefert HTML, JS, CSS, Bilder und Schriften aus. Nur `/api/*` verwendet die bestehenden Pages Functions, PostgreSQL/Neon, Session-Authentifizierung und Resend. Kein Next.js-Server, keine Server Actions, kein SSR-Hosting, keine zusätzliche Runtime oder kostenpflichtige Hosting-Komponente. Die bestehende Free-Pages-Architektur bleibt erhalten. Die bestehenden Nutzungslimits von Functions, Neon und Mail gelten unverändert.

`npm run build`, Ausgabeordner `out`, bestehende `wrangler.jsonc`, `public/_routes.json`, `_headers` und Deployment-Skripte bleiben maßgeblich. Der Frontend-Build verbindet sich nicht mit Neon. Diese Umsetzung wurde nicht deployed.

Die vorhandenen Paket-/Lockfile- und Neon-Konfigurationsänderungen stammen bereits aus dem Arbeitsverzeichnis vor dem Relaunch. Für den Relaunch wurden keine Dependencies hinzugefügt.

## Bestandsanalyse

- Frontend: Next.js 16.3.4, React 19, JavaScript/JSX, React Bootstrap, Bootstrap-CSS plus `styles/theme.css`.
- Routing: App Router, statischer Export mit trailing slash; bisherige Kursdetails über `/angebote/?slug=…`; zusätzliche CMS-Seiten über `/seite/?slug=…`.
- Backend: `functions/api/[[path]].js` delegiert an `lib/api.js`; kein Wechsel der Endpunkte oder Laufzeit.
- Daten: `course`, `site_setting`, `site_image`, Sessions und Rate Limits in Neon. Bilder werden über die vorhandene Mediathek verwaltet.
- CMS: Textgruppen, Navigation, Zusatzseiten, Kurse, Bildverwaltung, Vorschau und Export bleiben erhalten.
- Kontakt: Resend über vorhandene API. Bestehende Authentifizierung, Same-Origin-Prüfung, Limits und E-Mail-Fehlerbehandlung bleiben erhalten.
- Integrationen: vorhandener bestätigter Purple-Slot-Studiolink; individuelle neue Termine erhalten eigene explizite Buchungslinks. Calendly ist optional konfigurierbar.
- SEO: vorher überwiegend globale Metadaten und clientseitige Titel; jetzt individuelle statische Metadaten und crawlbare Editorial-Seiten.
- i18n: vorher keine Struktur; jetzt `de` und `en`, zentrale UI-Texte, `/en/`-URLs mit statisch erzeugten Unterseiten.
- Tests: Node-Test-Runner mit lokalem PGlite und Playwright gegen lokale Pages-Vorschau. Kein ESLint-/separater Typecheck-Task vorhanden.
- Accessibility: Skip-Link, ein H1 pro Editorial-Seite, Fokusmarkierung, Split-Dropdown mit Escape und Fokus-Rückgabe, natives FAQ, Formlabels, Touch-Ziele und reduzierte Bewegung.

## Seiten und Komponenten

Neue statische Seiten: `/zyklusberatung/`, `/praeventionskurse/`, `/praenatal/`, `/postnatal/`, `/individuelles-yoga/`, `/red-circle/`, `/offene-stunden/`, `/termine/`, `/agb/`. Home, Angebote, Über mich und Kontakt wurden überarbeitet. Impressum, Datenschutz, Admin und bisherige Kurs-/CMS-Links bleiben erreichbar.

- `lib/flow-content.js`: Editorial-Inhalte, Angebote, Preise, UI-Sprachen, Route-Metadaten.
- `components/Flow/Pages.jsx`: Home, Übersicht, Angebotsdetail, Prävention, About, Termine, offene Stunden, AGB.
- `components/Flow/Shared.jsx`: ButtonLink, Section, SectionHeader, Photo, CTA, FAQ, Events/EventCard, Testimonials, OpenClasses, BookingIntro. `SearchValue.jsx` kapselt Query-Parameter in einer kleinen Suspense-Grenze, damit die übrige Seite weiterhin statisches HTML enthält.
- `components/Components/Layout.jsx`: Navigation, Sprachwechsel, Footer, Tastaturverhalten.
- `styles/theme.css`: zentrale Markenfarben, responsive Layouts, lokale Fraunces-/Manrope-Schriften.
- `lib/flow-data.js`: gemeinsame Ereignisauswahl für Homepage, Termine und Angebotsseiten.

Bestehende CMS-Werte haben weiterhin Vorrang vor geänderten Defaults. Bereits gespeicherte frühere Marken-/Hero-Texte werden nicht stillschweigend überschrieben. Diese vor Veröffentlichung im CMS prüfen. Eigene Menükonfigurationen bleiben ebenfalls erhalten. Die neue Struktur ist die Standardnavigation; bestehende individuelle Menüs können in der vorhandenen Verwaltung angepasst werden.

## Daten: keine Migration, keine Produktionsänderung

Es wurden keine Datenbankverbindungen zu Neon aufgebaut, keine Migrationen ausgeführt, keine Seeds geschrieben und keine produktiven Inhalte geändert. SQL-Dateien und Migrationsskripte wurden nicht verändert.

Neue Sammlungen verwenden die bestehende `site_setting`-Struktur. Unter **Texte & Bilder → Relaunch: Dynamische Inhalte** gibt es drei JSON-Felder:

- `eventsJson`: zentrale Termine, Standard `[]`.
- `testimonialsJson`: Testimonials, Standard `[]`.
- `classesJson`: wiederkehrende offene Stunden, Standard `[]`.

Die vorhandene autorisierte CMS-Speicheraktion kann später echte, geprüfte Inhalte speichern. Diese Aufgabe führt keine solchen Aktionen gegen Produktion aus. Das öffentliche API-Ergebnis entfernt unveröffentlichte Datensätze; Startseite und Angebotsseiten verwenden dieselbe Sammlung. Vergangene Termine verschwinden aus der Anzeige, bleiben aber für Archivierung im CMS erhalten. Eine aktive Seite aktualisiert ihre Zeitauswahl jede Minute. Zeiten werden in Europe/Berlin ausgegeben.

Feldschema eines Termins (kein Seed):

```text
id: eindeutiger String
published: boolean (Standard false)
category: praenatal | postnatal | red-circle | weiterer Kategorie-Slug
title: String
start: ISO-Datum mit Jahr und Zeitzone, z.B. YYYY-MM-DDTHH:mm:ss+02:00
end: optionales ISO-Datum, Ende der ersten Veranstaltung
location: String
duration: String
price: Zahl in Euro
theme: optionaler String
bookingUrl: bestätigte HTTPS-URL oder leer
```

Das Datum eines Präventionskurses beschreibt dessen Start, nicht den gesamten achtteiligen Kurszeitraum. Keine vollständigen Stundenkonzepte werden veröffentlicht. Weitere Kursarten können dem Inhaltsregister und der Kategorieauswahl hinzugefügt werden; Zyklusyoga wird aktuell nicht als verfügbares Angebot dargestellt.

Testimonial-Felder: `id`, `published`, `name`, `quote`, `context`, `contexts` (Array von Seiten-Slugs, außerdem `home`). Namen wie „Alina S.“ werden unverändert angezeigt. Veröffentlichungsfreigaben vor dem Eintragen prüfen.

Offene-Stunden-Felder: `id`, `published`, `title`, `day`, `time` (`HH:MM`), `location`, `description`, `bookingLabel`, `bookingUrl` (leer oder HTTPS). Kein automatischer Fallback auf eine erfundene USC-/Studio-URL.

Die Eingaben werden serverseitig validiert: maximal 100 Datensätze, eindeutige IDs, gültige URLs, Zeitangaben, Status und Preise. `fixture-*`, `mock` und `developmentOnly` werden beim Speichern abgewiesen.

## Lokale Vorschau

Nur für `next dev`:

```sh
NEXT_PUBLIC_FLOW_FIXTURES=true npm run dev:ui
```

Die gelieferten Testimonialtexte und geplanten Termine befinden sich in `lib/fixtures/flow.js`. Sie werden nur bei `NODE_ENV=development` UND dem expliziten Flag importiert. Ein Production-Build schließt sie auch mit gesetztem Flag aus. Es existiert keine automatische Speicherung oder Seed-Verknüpfung.

Alle Fixture-Ansichten sind als lokale Vorschau markiert und haben keine direkte Buchung. Das Jahr 2026 bei den Oktoberterminen ist nur eine Entwicklungsannahme, da kein Jahr geliefert wurde. Red Circle: 08.11., MySenses, Thema offen; Jahr und Uhrzeit fehlen. Dieser unvollständige Entwurf steht separat in der Fixture-Datei und ist kein bestätigter buchbarer Termin.

## Externe Konfiguration und fehlende Inhalte

Im CMS unter **Relaunch: Kontakt & Buchungswege**:

- `calendlyCycle`: echte Calendly-URL für kostenloses Zyklus-Kennenlernen, ca. 20 Minuten.
- `calendlyYoga`: echte Calendly-URL für Yoga-Kennenlernen.
- `instagramUrl`: bestätigtes Instagram-Profil.
- `publicEmail`: vorbelegt mit der bereits im Impressum enthaltenen Adresse.

Ohne Calendly-Link wird eine Kontaktmöglichkeit angeboten. Calendly wird nicht eingebettet oder vorab geladen. Der Link öffnet erst nach dem Klick einen neuen Tab. Das spart Drittanbieter-Skripte und benötigt keine neue Einbettungs-/Consent-Infrastruktur.

Noch erforderlich: individuelle externe Buchungslinks für Präventionskurse/Red Circle, bestätigte USC-/MySenses-Links, Termin-Jahre und fehlende Uhrzeit/Thema des Circle. Preisangaben für individuelles Yoga sind ausdrücklich Planungswerte, zentral in `prices` anpassbar.

Für die Produktion bleiben Mail-Konfiguration (`RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_EMAIL`), Neon-Verbindung und Admin-Hash im bestehenden Cloudflare-Setup. Das Kontaktformular erfordert jetzt zusätzlich `privacyConsent: true`; die Servervalidierung erzwingt dies. Vorhandene externe Formular-Clients müssen das Feld ebenfalls senden.

### Bilder

Benötigt: echtes Portrait von Anna, persönliches About-Portrait, Beratungssituation, Teaching-/Pränatal-/Postnatal-Fotos, Gruppen-/Raumatmosphäre. Hero und About sind über die vorhandene Mediathek/CMS-Felder austauschbar. Die übrigen Angebotsbilder sind unter **Relaunch: Angebotsfotos** ebenfalls über die Mediathek austauschbar. Fehlende Bilder werden sichtbar als „Fotografie folgt“ bezeichnet.

`public/images/anna-yoga.png` bleibt erhalten. Weil nicht bestätigt ist, dass das vorhandene Motiv Anna authentisch zeigt, wird es nicht automatisch als ihr Portrait verwendet. Keine Stockbilder oder generierten Portraits wurden hinzugefügt.

### Rechtliches und Qualifikationen

Impressum und Datenschutz behalten die gelieferten Texte. Für den Relaunch fehlen die freigegebenen AGB sowie gegebenenfalls aktualisierte Angaben zu tatsächlichen Datenverarbeitungen. Die AGB-Route enthält bis dahin einen klaren Hinweis, keine erfundenen Vertragsbedingungen. Eine veröffentlichte CMS-Zusatzseite mit Slug `agb` befüllt die neue Route.

Qualifikationsgruppen sind vorbereitet; konkrete Ausbildungen, Institute und Abschlussangaben müssen ergänzt werden. „Heilpraktikerin in Ausbildung“ ist eindeutig laufende Ausbildung und keine Erlaubnis oder aktuelle Behandlung.

## Sprachen und SEO

Deutsch und Englisch haben eigene statisch exportierte Routen. Seiteninhalte, FAQs, Navigation, Formulartexte, Footer und Metadaten sind übersetzt. Die englischen Rechtstexte sind Übersetzungen der vorhandenen Eigentümertexte. Der redaktionelle Katalog liegt in `lib/flow-translations.js`; keine automatische Übersetzung und keine zusätzliche Laufzeit-Abhängigkeit. Unter „English content“ lassen sich englische CMS-Texte unabhängig pflegen. Leere englische Felder verwenden die mitgelieferte englische Fassung; Änderungen der deutschen Texte übersetzen sich nicht automatisch. Dynamische Termine unterstützen titleEn/durationEn/themeEn, offene Stunden titleEn/dayEn/descriptionEn/bookingLabelEn und Testimonials quoteEn/contextEn. Unbekannte dynamische Originaltexte benötigen redaktionelle Übersetzungen.

`NEXT_PUBLIC_SITE_URL` im **Cloudflare-Pages-Build-Environment** auf die bestätigte öffentliche Domain setzen. Erst dann werden Canonical und hreflang erzeugt; kein erfundener Domainname und keine localhost-Canonicals. Die Variable muss beim Build verfügbar sein, nicht lediglich im Functions-Runtime-Environment. OpenGraph-Titel und -Beschreibung sind vorhanden. Ein freigegebenes Social-Bild fehlt noch.

Wichtige Seiten enthalten bereits im exportierten HTML genau eine H1, semantische Abschnitte, eindeutige Titel und Beschreibungen. CMS-Inhalte und Termine werden wie bisher nachgeladen. Änderungen am Editorial-Register oder an Preisen benötigen einen neuen statischen Build; Termine und CMS-Texte nicht.

## Verifikation

- `npm test`: API/CMS/Auth/Konfiguration mit lokalem PGlite sowie neue Termin-, Fixture-, URL- und Consent-Tests.
- `npm run build`: statischer Production-Export.
- `npm run check:functions`: Pages-Functions-Kompilierung.
- `npm run test:browser`: CMS-Regressionen, alle Seiten Desktop/Mobile, Tastaturmenü, Sprache, Termine und Kontaktfehler.
- Lint: kein vorhandenes Skript/keine vorhandene ESLint-Konfiguration.
- Typecheck: JavaScript-Projekt ohne separaten Typecheck-Task; Next-Build-Kompilierung verwendet.

Browser-Screenshots liegen nach dem Test unter `test-results/relaunch-home-1440.png` und `test-results/relaunch-home-390.png`. Tests fangen sämtliche API-Aufrufe ab; produktive Neon-Daten bleiben unberührt.

### Cloudflare-Navigationskorrektur

Der frühere Wildcard-Redirect für `/angebote/:slug` fing auch die statischen Next.js-Payloads `index.txt` und `__next.*` ab. `public/_redirects` stellt diese Dateien jetzt vor der Legacy-Regel mit Status 200 direkt bereit. Die Entwicklungsweiterleitung akzeptiert nur gültige Kurs-Slugs. Es werden keine Functions dafür ausgeführt. Grundlage: [Cloudflare Pages Redirects/Proxying](https://developers.cloudflare.com/pages/configuration/redirects/#proxying).

### Lokale Prüfumgebung

Der Container enthielt zunächst keinen Chromium-Browser und keine Linux-Grafik-/Fontconfig-Bibliotheken. Chromium wurde mit dem bereits vorhandenen Playwright installiert; die Systembibliotheken und Basisschriften wurden ausschließlich nach `/tmp/flow-browser-libs` entpackt. Die Browserprüfungen verwenden dort `LD_LIBRARY_PATH` und `FONTCONFIG_FILE`. Das sind ausschließlich lokale Testvoraussetzungen und keine Projekt- oder Hosting-Abhängigkeiten.

## Ergebnis der Abschlussprüfung (18.09.2026)

- Production-Build erfolgreich: alle neuen Routes als statische Seiten exportiert.
- Cloudflare Pages Functions erfolgreich kompiliert.
- 22/22 Node-/API-/Datentests bestanden.
- 11/11 Playwright-Browsertests bestanden (2,5 Minuten): bestehende CMS-Funktionen, Formulare, alle deutschen Editorial-Seiten bei 1440 und 390 Pixeln, Tastatur-/Mobilnavigation, Englischwechsel, Terminfilter und alte Kurslinks.
- 26 deutsche/englische statische Editorial-HTML-Dateien auf genau eine H1, Meta Description und vorhandene lokale Linkziele geprüft: keine Fehler.
- Produktionsbundle auf die lokalen Termin-/Testimonial-Fixtures geprüft: keine enthalten.
- Fraunces und Manrope im echten Browser als erfolgreich geladen geprüft; Desktop- und Mobil-Screenshots visuell kontrolliert.
- Cloudflare liefert Next-Navigationsdateien und Schriften mit 200; bestehende Kursaliase weiterhin mit 302.
- JavaScript-Syntaxprüfungen und git diff --check erfolgreich. Keine separate Lint- oder Typecheck-Konfiguration vorhanden.
- Keine produktive Neon-Verbindung, kein Seed, keine Migration, keine produktiven Datenänderungen und kein Deployment.

Vor Veröffentlichung: bestätigte Fotos, Qualifikationsdetails, freigegebene AGB, Buchungs-/Instagram-URLs, Domainkonfiguration und echte Termine/Testimonials/offene Stunden ergänzen. Bestehende gespeicherte CMS-Texte und Menüs bewusst auf die neue Marke prüfen. Neue dynamische Inhalte jeweils auch auf Englisch pflegen.
