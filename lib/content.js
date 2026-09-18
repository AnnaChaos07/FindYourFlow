import { legalPages } from './legal-content.js';
// One registry for public copy, editor labels, defaults and server validation.
export const contentGroups = [
  { name: 'Allgemein & Fußzeile', fields: [
    ['siteName', 'Name der Website', 'Find Your Flow'],
    ['siteDescription', 'Beschreibung der Website', 'Räume für Frauengesundheit, Körperwissen und Verbindung – in Berlin und online.', 'textarea'],
    ['footerText', 'Fußzeile ({year} = aktuelles Jahr)', '© {year} Find Your Flow'],
    ['bookingUrl', 'Purple-Slot-Studiolink', 'https://find-your-flow.purpleslot.io/', 'booking'],
    ['menuToggleLabel', 'Menü-Schaltfläche: zugängliche Beschriftung', 'Menü öffnen oder schließen'],
  ] },
  { name: 'Relaunch: Kontakt & Buchungswege', fields: [
    ['calendlyCycle', 'Calendly: Zyklus-Kennenlernen (HTTPS)', '', 'calendly'],
    ['calendlyYoga', 'Calendly: Yoga-Kennenlernen (HTTPS)', '', 'calendly'],
    ['publicEmail', 'Öffentliche E-Mail', 'findyourflowab@gmail.com'],
    ['instagramUrl', 'Instagram-Profil (HTTPS)', '', 'link'],
  ] },
  { name: 'Relaunch: Angebotsfotos', fields: [
    ['cycleImage', 'Zyklusberatung: echtes Beratungsfoto', '', 'image'],
    ['yogaImage', 'Individuelles Yoga: echtes Teaching-Foto', '', 'image'],
    ['circleImage', 'Red Circle: Gruppen- oder Raumfoto', '', 'image'],
    ['prenatalImage', 'Pränatal: echtes Kursfoto', '', 'image'],
    ['postnatalImage', 'Postnatal: echtes Kursfoto', '', 'image'],
  ] },
  { name: 'Relaunch: Dynamische Inhalte', fields: [
    ['eventsJson', 'Termine (JSON; Anleitung in docs/RELAUNCH.md)', '[]', 'events'],
    ['testimonialsJson', 'Testimonials (JSON)', '[]', 'testimonials'],
    ['classesJson', 'Offene Stunden (JSON)', '[]', 'classes'],
  ] },
  { name: 'Startseite', fields: [
    ['heroEyebrow', 'Text über der Überschrift', 'FIND YOUR FLOW'],
    ['heroTitle', 'Überschrift', 'Dein Körper.\nDein Rhythmus.\nDein Weg.'],
    ['heroText', 'Einleitung', 'Räume für Frauengesundheit, Körperwissen und Verbindung – mit Zyklusberatung, Yoga und gemeinsamen Erfahrungen in Berlin und online.', 'textarea'],
    ['heroButtonLabel', 'Schaltfläche', 'Angebote entdecken'],
    ['heroButtonHref', 'Ziel der Schaltfläche', '/angebote/', 'link'],
    ['heroImage', 'Bildadresse (leer = Bildplatzhalter)', '', 'image'],
    ['heroImageAlt', 'Bildbeschreibung', 'Anna Baumbach – Find Your Flow'],
    ['homeCoursesTitle', 'Überschrift der Angebote', 'Annas Angebote'],
    ['courseButtonLabel', 'Schaltfläche an den Angeboten', 'Mehr erfahren'],
    ['coursesEmptyText', 'Text ohne Angebote', 'Neue Angebote findest du hier in Kürze.'],
  ] },
  { name: 'Über mich', fields: [
    ['aboutEyebrow', 'Text über der Überschrift', 'ÜBER MICH'],
    ['aboutTitle', 'Überschrift', 'Hi, ich bin Anna.'],
    ['aboutText', 'Text', 'Yoga war mein Einstieg in die Arbeit mit Körper und Wahrnehmung. Heute geht es für mich um Frauengesundheit, Zyklus und Körperwissen – und darum, den eigenen Körper besser zu verstehen, ohne ihn zum nächsten Selbstoptimierungsprojekt zu machen.', 'textarea'],
    ['aboutImage', 'Bildadresse (leer = Startseitenbild)', '', 'image'],
    ['aboutImageAlt', 'Bildbeschreibung', 'Anna'],
  ] },
  { name: 'Angebote & Buchung', fields: [
    ['offerIntro', 'Allgemeiner Angebotstext', 'Sanfte Übungen, bewusste Atmung und alltagstaugliche Impulse – ohne erforderliche Vorerfahrung.', 'textarea'],
    ['bookingTitle', 'Überschrift der Buchung', 'Buchung'],
    ['bookingText', 'Buchungshinweis', 'Verfügbare Termine und die verbindliche Buchung findest du bei Purple Slot.', 'textarea'],
    ['bookingButtonLabel', 'Buchungsschaltfläche', 'Bei Purple Slot buchen'],
    ['bookingUnavailableText', 'Text ohne Buchungslink', 'Für dieses Angebot ist die Online-Buchung noch nicht verfügbar.', 'textarea'],
    ['bookingContactLabel', 'Kontakt-Schaltfläche', 'Anna kontaktieren'],
    ['bookingContactHref', 'Kontakt-Ziel', '/kontakt/', 'link'],
    ['offerSelectText', 'Text ohne ausgewählten Kurs', 'Bitte wähle ein Angebot auf der Startseite.'],
    ['offersBackLabel', 'Zurück-Schaltfläche', 'Zu den Angeboten'],
    ['offerLoadingText', 'Ladeanzeige', 'Angebot wird geladen …'],
    ['offerMissingText', 'Nicht verfügbares Angebot', 'Dieses Angebot ist nicht verfügbar.'],
  ] },
  { name: 'Kontaktformular', fields: [
    ['contactTitle', 'Überschrift', 'Lass uns kennenlernen.'],
    ['contactIntro', 'Einleitung', 'Anna freut sich auf deine Nachricht.', 'textarea'],
    ['contactNameLabel', 'Feld: Name', 'Name'],
    ['contactEmailLabel', 'Feld: E-Mail', 'E-Mail'],
    ['contactSubjectLabel', 'Feld: Thema', 'Thema'],
    ['contactMessageLabel', 'Feld: Nachricht', 'Nachricht'],
    ['contactButtonLabel', 'Absenden-Schaltfläche', 'Nachricht senden'],
    ['contactSendingLabel', 'Schaltfläche während des Versands', 'Wird gesendet …'],
    ['contactSuccessText', 'Erfolgsnachricht', 'Deine Nachricht wurde versendet.'],
    ['contactErrorText', 'Fehlermeldung', 'Die Nachricht konnte nicht versendet werden. Bitte versuche es später erneut.', 'textarea'],
    ['contactPrivacyText', 'Datenschutzhinweis', '', 'textarea'],
    ['contactPrivacyLabel', 'Beschriftung des Datenschutzlinks', 'Datenschutz'],
    ['contactPrivacyHref', 'Datenschutz-Link (optional)', '/datenschutz/', 'link'],
  ] },
  { name: 'Fehler- und Hinweistexte', fields: [
    ['coursesErrorText', 'Angebote nicht ladbar', 'Die Angebote können gerade nicht geladen werden. Bitte versuche es später erneut oder kontaktiere Anna.', 'textarea'],
    ['notFoundTitle', 'Überschrift für fehlende Seiten', 'Seite nicht gefunden'],
    ['notFoundText', 'Text für fehlende Seiten', 'Die gewünschte Seite ist nicht verfügbar.'],
    ['homeLinkLabel', 'Link zur Startseite', 'Zur Startseite'],
    ['pageLoadingText', 'Seite wird geladen', 'Seite wird geladen …'],
    ['pageErrorText', 'Seite nicht ladbar', 'Diese Seite konnte nicht geladen werden. Bitte versuche es später erneut.'],
  ] },
];
// English editorial overrides use the existing settings store; no migration required.
export const englishFields = ['heroEyebrow','heroTitle','heroText','heroButtonLabel','heroImageAlt','aboutTitle','aboutText','aboutImageAlt','contactTitle','contactIntro','contactSuccessText','contactErrorText','contactPrivacyText'];
const baseFields = contentGroups.flatMap(group => group.fields);
contentGroups.push({name: 'English content', fields: englishFields.map(key => [key + 'En', key + ' (English; blank uses the supplied English copy)', '', baseFields.find(field => field[0] === key)?.[3] === 'textarea' ? 'textarea' : undefined])});
export const textDefaults = Object.fromEntries(contentGroups.flatMap(group => group.fields.map(([key, , value]) => [key, value])));
export const defaults = {
  ...textDefaults,
  navigation: [
    { id: 'home', label: 'Home', type: 'link', href: '/', visible: true, newTab: false, children: [] },
    { id: 'about', label: 'Über mich', type: 'link', href: '/ueber-mich/', visible: true, newTab: false, children: [] },
    { id: 'courses', label: 'Angebote', type: 'courses', href: '', visible: true, newTab: false, children: [] },
    { id: 'dates', label: 'Termine', type: 'link', href: '/termine/', visible: true, newTab: false, children: [] },
    { id: 'contact', label: 'Kontakt', type: 'link', href: '/kontakt/', visible: true, newTab: false, children: [] },
    { id: 'booking', label: 'Kennenlernen', type: 'link', href: '/kontakt/#kennenlernen', visible: true, newTab: false, children: [] },
  ],
  footerNavigation: [],
  pages: legalPages,
};
