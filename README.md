# Yoga mit Anna

Next.js (App Router) als statischer Export auf **Cloudflare Pages**, mit **Pages Functions** für die API und **Neon PostgreSQL** als Datenbank. Kein PHP, Symfony, Apache oder dauerhaft laufender Node-Server wird für das Hosting benötigt.

## Lokal starten

Node.js 22 verwenden:

```sh
npm ci
cp .dev.vars.example .dev.vars
npm run admin:password
# .dev.vars: Neon-Verbindung und erzeugten Passwort-Hash eintragen.
npm run db:migrate
# Nur für eine neue Datenbank ohne Bestandsdaten:
npm run db:seed
npm run dev
```

Die Website läuft auf http://localhost:3000. Next.js leitet `/api/*` zum lokalen Pages-Functions-Prozess auf Port 8788 weiter. Der Entwicklungsstart erlaubt dafür ausdrücklich die Origin `http://localhost:3000`. Für eine andere lokale Adresse mit `DEV_ORIGIN="http://DEIN-HOST:3000" npm run dev` starten; bei Docker die Variable im Service unter `environment` setzen. Diese Ausnahme gilt nur im lokalen Entwicklungsproxy. `npm run dev:ui` startet ausschließlich die Oberfläche.

Ohne Datenbank kann der statische Build erstellt werden, aber Kurse und Verwaltung sind erst mit konfigurierter Neon-Verbindung verfügbar. Bestehende Standardtexte bleiben als Fallback sichtbar.

## Cloudflare Pages

1. Projektwurzel ist der Ordner mit `package.json` und `wrangler.jsonc`, nicht dessen Unterordner `timo`. In Git die neue Anwendung aufnehmen; das lokale Archiv `legacy-symfony` ist ausgeschlossen.
2. Pages-Projekt mit dem Git-Repository verbinden. Build: `npm run build`; Ausgabeverzeichnis: `out`; Node-Version: `22`.
3. Unter Pages → Settings → Variables and Secrets für **Production und Preview getrennt** konfigurieren:
   - `DATABASE_URL`: Neon-PostgreSQL-Verbindung mit TLS. Secrets verwenden.
   - `ADMIN_PASSWORD_HASH`: Ausgabe von `npm run admin:password`. Secrets verwenden.
   - `PURPLE_SLOT_BOOKING_URL`: optionaler allgemeiner Studiolink.
   - `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_EMAIL`: E-Mail-Versand für das Kontaktformular. `CONTACT_FROM` muss eine bei Resend verifizierte Absenderadresse sein.
4. Schema vor dem ersten produktiven Aufruf auf der jeweiligen Neon-Datenbank anwenden (`npm run db:migrate` mit deren `DATABASE_URL`). Für Vorschauen einen separaten Neon-Branch verwenden.
5. Unter `/admin/` anmelden, Texte und Kurse prüfen und die echten Purple-Slot-Links eintragen.

`wrangler.jsonc` konfiguriert die Pages-Ausgabe. Cloudflare kompiliert `functions/` zusätzlich zum Next.js-Export. **Nur `out/` per Dashboard hochzuladen reicht für die API nicht aus.** Alternativ nach Einrichtung des Cloudflare-Kontos: `npx wrangler pages deploy out` aus der Projektwurzel. Es wurde noch kein Deployment durchgeführt.

Prüfen:

```sh
npm test
npm run build
npm run check:functions
npm run preview
```

`npm run preview` stellt den tatsächlichen Export zusammen mit den Pages Functions auf Port 8788 bereit. `next start` ist für diesen statischen Export nicht vorgesehen. Docker ist optional: `docker compose -f compose.dev.yml up --build` startet die lokale Entwicklung mit Node, ohne PHP oder lokalen Datenbankdienst.

## Purple Slot

Der alte PayPal-Checkout wurde durch einen externen Purple-Slot-Buchungslink ersetzt. Pro Kurs lässt sich im Adminpanel ein eigener HTTPS-Link konfigurieren, alternativ ein allgemeiner Studiolink unter „Texte & Bild“ oder über `PURPLE_SLOT_BOOKING_URL`. Es werden nur `purpleslot.io` und deren Subdomains akzeptiert. Ein im Adminpanel gespeicherter Studiolink hat Vorrang vor der Umgebungsvariable; ein leeres gespeichertes Feld deaktiviert diesen Fallback.

Ohne Link zeigt das Angebot eine Kontaktmöglichkeit. Preise auf der Website sind redaktionelle Angaben; verbindliche Termine, Verfügbarkeit, Buchung und Zahlung erfolgen bei Purple Slot. Es gibt **keine automatische Kurs-/Preis-Synchronisierung, kein eingebettetes Widget und keine Webhooks**: Der Studiolink https://find-your-flow.purpleslot.io/ ist hinterlegt. Für eine automatische Synchronisierung fehlt weiterhin eine bestätigte Schnittstellendokumentation. Es werden keine erfundenen API-Endpunkte angesprochen.

Neue Kurse funktionieren ohne erneuten Build unter `/angebote/?slug=...`. Bisherige Links `/angebote/<slug>` werden durch Pages auf diese Seite weitergeleitet. Kursdaten und bearbeitete Texte werden zur Laufzeit geladen; individuelle Kurs-Metadaten sind daher nicht statisch vorgerendert.

## Bestandsdaten übernehmen

Der ursprüngliche Quellcode, die Doctrine-Migrationen und die alte private `.env` liegen lokal unter `legacy-symfony/`. Das Archiv wird nicht veröffentlicht. Die vorhandenen Verzeichnisse `vendor/` und `var/` sind ebenfalls kein Teil der neuen Laufzeit. Das alte PostgreSQL-Dockerfile liegt ausschließlich im Archiv. Das neue App-Image installiert die npm-Abhängigkeiten und läuft als Benutzer `node`. Compose verwendet separate Volumes für `node_modules` und den Next.js-Cache.

Die Tabellen `course`, `booking` und `site_setting` sind kompatibel zur bisherigen PostgreSQL-Struktur. `database/001_schema.sql` ergänzt diese um `booking_url`, Bilder, Sitzungen und Anmeldelimits. `database/003_cms.sql` ergänzt Veröffentlichungsstatus, Kursreihenfolge und Langbeschreibungen und trägt den gelieferten Studiolink ein, falls noch kein anderer Link gespeichert ist. Der Migrationsrunner protokolliert ausgeführte Migrationen in `app_migration`, damit spätere Einstellungen bei Wiederholungen erhalten bleiben. Vorhandene Kurse, Texte und historische PayPal-Buchungen werden weder gelöscht noch neu erzeugt. Ein Kurs mit historischen Buchungen kann weiterhin nicht gelöscht werden.

Für einen Wechsel auf eine frische Neon-Datenbank zuerst ein PostgreSQL-Backup der bisherigen Datenbank erstellen und in Neon wiederherstellen (z. B. mit `pg_dump` und `pg_restore`), danach `npm run db:migrate` ausführen. Bei selektivem Import `course`, `booking`, `site_setting` samt Identity-Sequenzen berücksichtigen. Erst danach den Zugriff umstellen und Datensätze vergleichen. **Es wurden noch keine Daten nach Neon übertragen. Die bisherige lokale Datenbank wurde am 09.09.2026 vollständig gesichert; die Anwendungstabellen course, booking und site_setting waren leer. Das geprüfte Backup liegt privat unter .local/backups/.** Die SQL-Datei `legacy-symfony/src/insert.sql` gehört zu einem anderen Datenmodell und darf dafür nicht ausgeführt werden.

Vorhandene Bilddateien unter `public/uploads` bleiben beim Export erhalten. Neue Admin-Uploads werden als JPEG/PNG/WebP bis 2 MB in Neon gespeichert und über `/api/images/<id>` ausgeliefert. Alte Bildversionen bleiben erhalten, damit gecachte Seiten und bestehende Links weiter funktionieren. Für umfangreichere Medienbibliotheken empfiehlt sich später Objektspeicher.

## Verwaltung und Kontakt

Admin-Sitzungen gelten acht Stunden, sind über HttpOnly/SameSite-Cookies geschützt und werden serverseitig in Neon gespeichert. Über HTTPS ist das Cookie zusätzlich Secure. Abmelden widerruft die Sitzung. Ein Passwortwechsel erfordert zum sofortigen Widerruf alter Sitzungen zusätzlich `DELETE FROM admin_session` in der Datenbank.

Schreibende API-Aufrufe prüfen die Origin. Anmeldung und Kontakt sind auf fünf Versuche je 15 Minuten und IP begrenzt; die Datenbank speichert dafür nur einen Hash des Schlüssels. Abgelaufene Limits werden bei weiteren Versuchen bereinigt, abgelaufene Sitzungen bei der Anmeldung.

Für den bisherigen SMTP-Versand nutzt die neue Function die HTTP-API von Resend. Ohne deren Konfiguration meldet das Kontaktformular ausdrücklich einen Fehler. Nachrichteninhalte werden nicht in Neon gespeichert. Der Versand gilt erst bei erfolgreicher Annahme durch den E-Mail-Dienst als erfolgreich; Zustellung beim Empfänger ist damit nicht garantiert.

Dokumentation: [Next.js Static Export](https://nextjs.org/docs/app/guides/static-exports), [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/), [Neon](https://neon.com/docs/serverless/serverless-driver), [Purple Slot](https://purpleslot.io/en), [Resend](https://resend.com/docs/api-reference/emails/send-email).

## Erweiterte Inhaltsverwaltung

Nach dem Update einmal `npm run db:migrate` gegen die gewünschte Neon-Datenbank ausführen. Es wurden keine Live-Zugangsdaten verwendet und keine produktiven Migrationen ausgeführt.

Unter `/admin/` stehen diese Bereiche bereit:

- **Texte & Bilder:** öffentliche Überschriften, Fließtexte, Schaltflächen und Linkziele, Website-Name, Fußzeile, Formularbeschriftungen, Erfolgs-/Fehlertexte, Startseiten- und Über-mich-Bild samt Alternativtext. Die Felder sind nach Seiten gruppiert. Leere optionale Schaltflächen werden ausgeblendet. `{year}` in der Fußzeile wird durch das aktuelle Jahr ersetzt.
- **Menüs:** Haupt- und Fußmenü mit frei wählbaren Beschriftungen, Reihenfolge, Sichtbarkeit, externen Links, Buchungslink und einer Ebene eigener Unterpunkte. Die automatische Angebotsliste enthält nur veröffentlichte Kurse. Links zu Entwurfsseiten werden öffentlich ausgeblendet.
- **Zusätzliche Seiten:** bis zu 50 Seiten mit Titel, Einleitung und bis zu 30 sortierbaren Abschnitten aus Text, Bild und optionaler Schaltfläche. Vorschau vor dem Speichern, Entwurf/Veröffentlichung und Löschen. Erst speichern, anschließend im Menü verlinken. Bei Änderung des Seitenkürzels bestehende Menülinks anpassen.
- **Kurse:** Kurz- und Langbeschreibung, Preis, Dauer, eigener Purple-Slot-Link, Sortiernummer und Entwurfsstatus. Ausgeblendete Kurse sind auch über die öffentliche API nicht abrufbar. Kurse mit historischen Buchungen können statt einer Löschung ausgeblendet werden.
- **Mediathek:** Uploads bis 2 MB; die 100 neuesten Bilder werden angezeigt. Eine hochgeladene Bildadresse lässt sich in mehreren Bildfeldern verwenden. Ein Upload allein verändert keine öffentliche Seite; erst das jeweilige Bildfeld speichern. Bestehende Bildadressen bleiben gültig.

Änderungen werden pro Bereich gespeichert. Ungespeicherte Änderungen bleiben beim Wechsel zwischen Admin-Tabs erhalten; beim Schließen/Neuladen der Seite erscheint eine Browserwarnung. Über „Gespeicherte Inhalte exportieren“ erhältst du ein JSON mit gespeicherten Texten, Menüs, Seiten und Kursen. Dieses Dokument enthält Bildadressen, aber keine Bilddateien, Zugangsdaten oder Buchungen; es ersetzt kein Datenbankbackup.

Neue Seiten sind unter `/seite/?slug=DEIN-KUERZEL` ohne erneuten Build verfügbar. Titel und Beschreibung werden im Browser nach dem Laden aktualisiert; für individuell vorgerenderte Suchmaschinen-Metadaten wäre eine Erweiterung des Build-/Rendering-Konzepts nötig. Öffentlich gelieferte Inhalte enthalten keine Seitenentwürfe. Text wird sicher als Text dargestellt, nicht als frei ausführbares HTML. Ein Speichervorgang darf höchstens 1 MB JSON enthalten.

Backend-Fehlerdiagnosen und die Beschriftungen der Verwaltung selbst sind keine redaktionellen Website-Inhalte. Das Kontaktformular verwendet den bearbeitbaren allgemeinen Fehlertext. Die übrige Buchungsabwicklung bleibt bei Purple Slot.

Browserprüfungen mit einer isolierten PostgreSQL-Testdatenbank (PGlite) und der echten API-Logik, ohne Live-E-Mails oder Neon-Zugang:

```sh
# Auf Linux ggf. zuerst mit administrativen Rechten:
# npx playwright install-deps chromium
npx playwright install chromium
npm run build
npm run test:browser
```

Die Tests starten die Cloudflare-Pages-Vorschau selbst. Screenshots und Fehler-Traces liegen unter `test-results/`.

## Vorbereiteter Livegang

Der lokale Admin-Zugang ist erzeugt. Das Passwort steht ausschließlich in `.local/admin-access.txt`, der Hash in `.dev.vars`. Beide Dateien sowie das Datenbankbackup unter `.local/backups/` sind von Git und Docker ausgeschlossen. Das Passwort wird erst nach der Konfiguration von Neon und der Ausführung der Migrationen nutzbar; es wurde noch kein Cloudflare-Secret gesetzt.

Die alte Datenbank war erreichbar, enthielt aber noch keine Kurse, Buchungen oder Seiteneinstellungen. Es gibt damit keine bestehenden Anwendungsdatensätze zu übertragen. Das vollständige PostgreSQL-Archiv bleibt als Sicherung erhalten. Für einen späteren Restore auf einer leeren Datenbank kann `pg_restore --no-owner --no-privileges` verwendet werden.

Nächste Einrichtungsschritte:

1. In `.dev.vars` die echte Neon-URL als `DATABASE_URL` und die Resend-/E-Mail-Werte eintragen. Geheimnisse nicht in Git aufnehmen. Lokale Werte in `.dev.vars` haben bei den Setup- und Migrationsskripten Vorrang vor geerbten Umgebungsvariablen. Damit wird die alte Docker-Datenbank nicht versehentlich verwendet.
2. `npm run setup:check`, anschließend `npm run db:migrate` ausführen. Die Migrationsskripte akzeptieren ausschließlich Neon-Verbindungen mit TLS. Für die bisherigen Beispielangebote optional `npm run db:seed`; Preise und Kursangaben vor Veröffentlichung prüfen.
3. Mit dem vorbereiteten Admin-Zugang Inhalte bearbeiten. Die gelieferten Impressums- und Datenschutztexte sind unter `/impressum/` und `/datenschutz/` statisch verfügbar und im Fußmenü verlinkt. Das Kontaktformular enthält ebenfalls einen Datenschutzlink. Veröffentlichte CMS-Seiten mit den Kürzeln `impressum` und `datenschutz` ersetzen zur Laufzeit die mitgelieferten Texte; ohne veröffentlichte CMS-Fassung bleiben die mitgelieferten Texte sichtbar. Änderungen an diesen statischen Ausgangstexten erfolgen in `lib/legal-content.js` und benötigen einen neuen Build.
4. Cloudflare einmal anmelden: `npx wrangler login`. Falls kein Pages-Projekt besteht: `npx wrangler pages project create yoga-mit-anna --production-branch main`. Bei einem anderen Namen `CF_PAGES_PROJECT_NAME` in `.dev.vars` setzen.
5. `npm run deploy` prüft die Konfiguration, Tests, Build, Functions und Migrationen, überträgt die Laufzeit-Secrets über eine temporäre private Datei und veröffentlicht den Build im bereits angelegten Pages-Projekt. Das Skript legt keine Datenbank an und führt keine Datenbankmigration automatisch aus. Für Git-Integration alternativ das Repository in Cloudflare verbinden; die Skripte können unabhängig davon genutzt werden.
6. Die eigene Domain in Cloudflare Pages verbinden und anschließend `npm run check:live -- https://DEINE-DOMAIN` ausführen. Diese Prüfung liest nur Seiten und API-Daten; sie versendet keine E-Mails und verändert keine Inhalte. Den tatsächlichen E-Mail-Eingang und die Buchungsabwicklung separat prüfen.

`npm run setup:check -- --online` prüft zusätzlich die Erreichbarkeit der konfigurierten Neon-Datenbank, Migrationen und das Vorhandensein veröffentlichter Impressums-/Datenschutzseiten. Inhaltliche Hinweise werden gemeldet; die Texte werden dabei nicht inhaltlich bewertet. Der Statusbericht enthält keine Geheimnisse und liegt in `.local/setup-status.json`.

Die GitHub-Actions-Datei `.github/workflows/ci.yml` führt Tests, Build, Functions-Kompilierung und Browserprüfungen bei Pushes und Pull Requests aus. Sie veröffentlicht nichts und benötigt keine produktiven Zugangsdaten.
