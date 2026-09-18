import { translate } from './flow-translations.js';
// Editorial content is kept separate from rendering. Add translations per locale;
// English copy lives in the shared authored translation catalog.
export const offerLinks = [
  ['zyklusberatung', 'Zyklusberatung', 'Deinen Körper besser verstehen', 'Cycle consultation', 'Understand your body better'],
  ['praeventionskurse', 'Präventionskurse', 'Bewegung für deine Lebensphase', 'Prevention courses', 'Movement for your stage of life'],
  ['individuelles-yoga', 'Individuelles Yoga', 'Eine Praxis, die zu dir passt', 'Individual yoga', 'A practice that fits you'],
  ['red-circle', 'Red Circle · Frauenkreise', 'Ehrlicher Austausch unter Frauen', 'Red Circle · Women’s circles', 'Honest conversation among women'],
  ['offene-stunden', 'Offene Stunden', 'Ankommen, bewegen, durchatmen', 'Open classes', 'Arrive, move and breathe'],
];
export const ui = {
  de: { home: 'Home', about: 'Über mich', offers: 'Angebote', dates: 'Termine', contact: 'Kontakt', meet: 'Kennenlernen', discover: 'Angebote entdecken', more: 'Mehr erfahren', book: 'Platz buchen', message: 'Nachricht schreiben', allDates: 'Alle Termine', emptyDates: 'Neue Termine werden hier veröffentlicht. Melde dich gern, wenn du über das nächste Angebot erfahren möchtest.', loading: 'Termine werden geladen …', dataError: 'Aktuelle Inhalte sind gerade nicht erreichbar. Bitte versuche es später erneut oder schreib mir.', fallback: '', skip: 'Zum Inhalt', menu: 'Menü öffnen oder schließen' },
  en: { home: 'Home', about: 'About Anna', offers: 'Offerings', dates: 'Dates', contact: 'Contact', meet: 'Let’s meet', discover: 'Explore offerings', more: 'Learn more', book: 'Book a place', message: 'Send a message', allDates: 'All dates', emptyDates: 'New dates will be published here. Get in touch to ask about the next offering.', loading: 'Loading dates …', dataError: 'Current details are unavailable. Please try again later or contact me.', fallback: '', skip: 'Skip to content', menu: 'Open or close menu' },
};
export const hrefFor = (slug = '', locale = 'de') => `${locale === 'en' ? '/en' : ''}/${slug ? slug + '/' : ''}`;
export const prices = { cycle: '369 €', checkin: '125 €', followup: '115 €', yoga: 'ab 90 €', yogaFive: '425 €', group: 'ab 120 €', prevention: '165 €', circle: '45 €' };
export const principles = [
  ['Fundiert statt dogmatisch.', 'Wissen soll Orientierung geben, ohne zur nächsten Sammlung von Regeln zu werden.'],
  ['Individuell statt One-size-fits-all.', 'Nicht jeder Körper und nicht jede Lebenssituation brauchen dasselbe.'],
  ['Körperwissen statt Selbstoptimierung.', 'Es geht nicht darum, den Körper noch besser zu kontrollieren, sondern ihn besser zu verstehen.'],
  ['Verbindung statt allein damit sein.', 'Verbindung mit dem eigenen Körper und Verbindung miteinander.'],
];
export const worlds = [
  { label: 'VERSTEHEN', title: 'Zyklus & Frauengesundheit', text: 'Den eigenen Zyklus und die Signale des Körpers besser verstehen. Mit Wissen, das Orientierung gibt – und Raum für deine eigenen Erfahrungen.', links: ['zyklusberatung'], image: 'Gespräch & Zyklusberatung' },
  { label: 'BEWEGEN & SPÜREN', title: 'Yoga & Prävention', text: 'Bewegen, wahrnehmen, entspannen. Eine Praxis finden, die zu deinem Körper und deiner aktuellen Lebensphase passt.', links: ['praeventionskurse', 'individuelles-yoga', 'offene-stunden'], image: 'Anna beim Unterrichten' },
  { label: 'VERBINDEN', title: 'Verbindung & gemeinsame Räume', text: 'Anderen Frauen begegnen, sich austauschen und Gemeinschaft erleben. Du darfst so ankommen, wie du gerade bist.', links: ['red-circle'], image: 'Frauenkreis & gemeinsamer Raum' },
];
export const pages = {
  zyklusberatung: {
    title: 'FIND YOUR CYCLE', eyebrow: 'ZYKLUSBERATUNG · BERLIN & ONLINE', subtitle: 'Deine individuelle Zyklusbegleitung',
    intro: 'Du brauchst nicht noch mehr Regeln. Du brauchst einen besseren Blick auf das, was bei dir passiert.',
    description: 'Individuelle Zyklusberatung in Berlin und online: Zykluswissen, Symptomtracking und alltagstaugliche Impulse mit Anna.',
    image: 'Anna im Beratungsgespräch', price: prices.cycle, facts: '3 Termine · jeweils ca. 60–75 Minuten',
    sections: [
      ['Dein Körper ist nicht dein Gegner.', 'Vielleicht ist dein Zyklus unregelmäßig, stark beschwerlich oder verändert. Vielleicht beschäftigen dich PMS, Müdigkeit oder Erschöpfung. Oder du möchtest deine Körpersignale besser verstehen und wieder mehr Kontakt zu dir selbst finden. Hier ist Raum für Beschwerden, die du mit Zyklus oder Hormonen in Verbindung bringst – ohne vorschnelle Antworten.'],
      ['Verstehen statt 101 neue Regeln.', 'Wir verbinden Zykluswissen und Zyklus-/Symptomtracking mit kleinen, realistischen Schritten. Je nach Anliegen fließen Bewegung, Yoga, Entspannung, Stressmanagement, Schlaf, allgemeine alltagsbezogene Ernährungsprinzipien und weitere Lebensgewohnheiten ein. Wir priorisieren gemeinsam, was für dich gerade sinnvoll ist.'],
    ],
    steps: [
      ['01', 'Verstehen & Standort bestimmen', '60–75 Minuten. Im ausführlichen Erstgespräch geht es um deinen Zyklus, Beschwerden, Lebenssituation, Gewohnheiten und vorhandenes Wissen. Du bekommst erste kleine Impulse und startest dein Tracking. Vor allem darfst du dich gehört, gesehen und ernst genommen fühlen.'],
      ['02', 'Einordnen & fokussieren', 'Typischerweise nach 1–2 Wochen. Wir besprechen erste Beobachtungen, ordnen Zusammenhänge ein und setzen Schwerpunkte. Daraus entstehen konkrete Impulse, die in deinen Alltag passen.'],
      ['03', 'Reflektieren & nachjustieren', 'Ungefähr in Woche 5–7, bei Bedarf später. Wir betrachten dein Tracking, reflektieren Veränderungen und Muster, passen Empfehlungen an und bestimmen deinen nächsten Schritt.'],
    ],
    note: 'Der erste gemeinsame Zeitraum umfasst typischerweise 5–7 Wochen oder bei Bedarf länger. Vor- und Nachbereitung sowie kurze Rückfragen zwischen den Terminen sind enthalten. Eine permanente Messenger-Betreuung ist nicht Teil des Angebots. Die Begleitung umfasst keine medizinische Diagnostik oder Behandlung von Krankheiten.',
    faq: [['Was passiert beim kostenlosen Kennenlernen?', 'In etwa 20 Minuten lernen wir uns kennen, sprechen grob über dein Anliegen und klären Erwartungen. Gemeinsam schauen wir, ob die Zusammenarbeit passt. Eine vollständige Anamnese findet dabei nicht statt.'], ['Wie geht es nach den drei Terminen weiter?', 'Veränderung folgt keinem festen Zeitplan. Wir entscheiden gemeinsam, ob und in welchem Abstand weitere Begleitung sinnvoll ist. Es gibt kein verpflichtendes Abo.']],
  },
  'individuelles-yoga': {
    title: 'Individuelles Yoga', eyebrow: 'DEINE PRAXIS · BERLIN & ONLINE', subtitle: 'Eine Praxis, die sich deinem Körper anpasst – nicht andersherum.',
    intro: 'Du musst weder beweglich noch erfahren sein. Wir finden gemeinsam heraus, welche Bewegung, Ruhe und Begleitung dir gerade guttun.',
    description: 'Individuelles Yoga in Berlin und online: Yoga 1:1, private Gruppen und Firmenyoga mit Anna.', image: 'Anna begleitet eine individuelle Yogapraxis',
    sections: [['Yoga 1:1', 'Für deinen Einstieg oder Wiedereinstieg, die Vertiefung deiner Praxis, Schwangerschaft und Postpartum oder mehr Entspannung. Auch wenn du dich in offenen Klassen unwohl fühlst, körperliche Besonderheiten mitbringst oder Sorge hast, nicht gut genug zu sein: Hier richten wir die Praxis an dir aus. Einzelstunden sind möglich. Längere Begleitung ist willkommen, aber keine Voraussetzung.'], ['Ein Ort, der zu dir passt.', 'Online, als Hausbesuch nach Absprache oder in einem angemieteten Raum in Berlin. Raummiete liegt aktuell bei ungefähr 30 € pro Stunde und kann zusätzlich anfallen. Bei Hausbesuchen kann je nach Entfernung eine Anfahrtspauschale dazukommen. Wir klären die Gesamtkosten vorher.']],
    faq: [['Muss ich Yoga-Erfahrung haben?', 'Nein. Wir beginnen dort, wo du gerade stehst. Du brauchst keine bestimmte Beweglichkeit oder Vorerfahrung.'], ['Kann ich eine einzelne Stunde buchen?', 'Ja. Auch eine einzelne Stunde ist möglich. Gemeinsam können wir entscheiden, ob du dir weitere Begleitung wünschst.']],
  },
  'red-circle': {
    title: 'RED CIRCLE', eyebrow: 'FRAUENKREISE · BERLIN', subtitle: 'Raum für ehrlichen Austausch.',
    intro: 'Wir brauchen Räume, in denen wir nicht leisten, erklären oder uns vergleichen müssen.', description: 'Red Circle in Berlin: ein Frauenkreis für ehrlichen Austausch, Gemeinschaft, Verbindung und Körperwissen.', image: 'Einladender Raum für den Frauenkreis', price: prices.circle, facts: '2 Stunden · ein Frauenraum',
    sections: [['Zusammenkommen. Zuhören. Einfach sein.', 'Als Frauen zusammenzukommen kann kraftvoll und wohltuend sein. Es gibt noch immer zu wenige Räume, in denen wir frei von Bewertung sprechen, zuhören und miteinander sein können. Red Circle ist ein bewusster Frauenraum für Gemeinschaft, Verbindung und Körperwissen.'], ['Jeder Circle hat sein eigenes Thema.', 'Im Mittelpunkt stehen Begegnung und Austausch. Kleine Wissensimpulse, Körperwahrnehmung, Übungen oder Journaling können den Abend ergänzen. Etwa vier Fünftel der Zeit gehören dem Circle und der Begegnung. Du brauchst keine Erfahrung mit Frauenkreisen oder spirituellen Praktiken.'], ['Du entscheidest, was du teilen möchtest.', 'Du darfst erzählen, still zuhören und deine Grenzen wahrnehmen. Es gibt keine Erwartung, dich zu öffnen oder etwas Bestimmtes zu erleben.']],
    faq: [['Muss ich etwas vorbereiten?', 'Nein. Du brauchst keine Vorerfahrung. Informationen zum jeweiligen Thema und Ort findest du beim Termin.'], ['Muss ich im Kreis sprechen?', 'Nein. Du entscheidest selbst, was und wie viel du teilst. Zuhören ist genauso willkommen.']],
  },
  praenatal: {
    title: 'Pränatal Yoga', eyebrow: 'HATHA YOGA · PRÄVENTION', subtitle: 'Zeit für dich. Und für das, was wächst.',
    intro: 'Bewegung, bewusste Atmung und Ruhe in deiner Schwangerschaft – mit Raum für dein eigenes Tempo.', description: 'Pränatal Yoga und Schwangerschaftsyoga in Berlin: acht Termine mit Anna, Körperwahrnehmung und Entspannung.', image: 'Anna unterrichtet Schwangerschaftsyoga', price: prices.prevention, facts: '8 Termine · zertifizierter Präventionskurs nach §20 SGB V',
    sections: [['Was dich erwartet', 'Eine ruhige, zugewandte Hatha-Yoga-Praxis, die Bewegung und Entspannung verbindet. Du bekommst Zeit, deinen sich verändernden Körper wahrzunehmen und bei dir anzukommen.'], ['Für wen ist der Kurs?', 'Für Schwangere, die sich bewusst bewegen und Zeit für sich nehmen möchten. Yoga-Erfahrung ist nicht nötig. Bei Unsicherheiten zu deiner individuellen Teilnahme kläre diese bitte vorab mit deiner betreuenden Fachperson.'], ['Unsere Schwerpunkte', 'Körperwahrnehmung, angepasste Bewegung, bewusste Atmung und Entspannung. Du entscheidest, was sich heute stimmig anfühlt.']],
    faq: [['Brauche ich Vorerfahrung?', 'Nein. Du wirst individuell begleitet und kannst die Praxis an deine Bedürfnisse anpassen.'], ['Wie funktioniert der Krankenkassenzuschuss?', 'Eine Bezuschussung ist möglich. Höhe und Voraussetzungen hängen von deiner Krankenkasse ab. Bitte erkundige dich vor der Buchung direkt dort.']],
  },
  postnatal: {
    title: 'Postnatal Yoga', eyebrow: 'HATHA YOGA · PRÄVENTION', subtitle: 'Wieder bei dir ankommen. Mit Baby.',
    intro: 'Ein Raum für Bewegung und Ruhe nach der Geburt. Dein Baby darf dabei sein – und du musst hier nichts leisten.', description: 'Postnatal Yoga mit Baby in Berlin: Yoga nach der Geburt, Körperwahrnehmung und Entspannung in acht Terminen.', image: 'Postnatal Yogastunde mit Babys', price: prices.prevention, facts: '8 Termine · zertifizierter Präventionskurs nach §20 SGB V',
    sections: [['Was dich erwartet', 'Eine achtsame Hatha-Yoga-Praxis mit Platz für die Bedürfnisse von dir und deinem Baby. Stillen, Füttern, Wickeln und Pausen gehören selbstverständlich dazu.'], ['Für wen ist der Kurs?', 'Für Menschen nach der Geburt, die wieder in Bewegung kommen und sich Zeit für den eigenen Körper nehmen möchten. Den geeigneten Einstieg klärst du individuell mit deiner Hebamme oder ärztlichen Begleitung. Der Kurs ersetzt keine Rückbildung.'], ['Unsere Schwerpunkte', 'Sanfte Bewegung, Körperwahrnehmung, Stabilität, Atmung und Entspannung. Du findest eine Praxis, die zu deinem Alltag nach der Geburt passt – ohne Druck.']],
    faq: [['Darf mein Baby mitkommen?', 'Ja. Dein Baby ist willkommen. Du kannst jederzeit pausieren und dich kümmern.'], ['Ersetzt der Kurs die Rückbildung?', 'Nein. Postnatal Yoga ersetzt keine Rückbildung. Stimme den passenden Zeitpunkt für deinen Einstieg mit deiner betreuenden Fachperson ab.'], ['Ist ein Krankenkassenzuschuss möglich?', 'Ja, eine Bezuschussung ist möglich. Bitte kläre die Voraussetzungen und die Höhe vor der Buchung mit deiner Krankenkasse.']],
  },
};
export const routeTitles = { '': 'Frauengesundheit, Körperwissen & Verbindung', 'ueber-mich': 'Über Anna', angebote: 'Angebote', praeventionskurse: 'Hatha Yoga Präventionskurse in Berlin', termine: 'Termine in Berlin', 'offene-stunden': 'Offene Yogastunden in Berlin', kontakt: 'Kontakt & Kennenlernen', agb: 'AGB', impressum: 'Impressum', datenschutz: 'Datenschutz', ...Object.fromEntries(Object.entries(pages).map(([key, p]) => [key, p.title])) };
export function pageMetadata(slug = '', locale = 'de') {
  const title = translate(routeTitles[slug] || 'Find Your Flow', locale);
  const description = translate(pages[slug]?.description || ({ '': 'Räume für Frauengesundheit, Körperwissen und Verbindung. Zyklusberatung, Yoga und Frauenkreise mit Anna in Berlin und online.', 'ueber-mich': 'Lerne Anna und ihre Haltung kennen: fundierte, individuelle Begleitung für Frauengesundheit, Zyklus und Körperwahrnehmung.', angebote: 'Zyklusberatung, Präventionskurse, individuelles Yoga und Red Circle: Finde das Angebot, das zu dir passt.', termine: 'Kommende Kursstarts, Frauenkreise und weitere Termine von Find Your Flow in Berlin.', kontakt: 'Lerne Anna kennen oder schreibe ihr zu Zyklusberatung, Yoga, Präventionskursen und Red Circle.', praeventionskurse: 'Hatha Yoga Präventionskurse in Berlin: Pränatal und Postnatal. Acht Termine, 165 Euro, Bezuschussung durch die Krankenkasse möglich.', 'offene-stunden': 'Offene Yogastunden mit Anna in Berlin: aktuelle Zeiten, Orte und Buchungswege.', agb: 'Informationen zu den Allgemeinen Geschäftsbedingungen von Find Your Flow.' })[slug] || (slug === 'impressum' ? 'Anbieterangaben von Find Your Flow.' : 'Datenschutzhinweise von Find Your Flow.'), locale);
  return { title, description, ...(process.env.NEXT_PUBLIC_SITE_URL ? { alternates: { canonical: hrefFor(slug, locale), languages: { de: hrefFor(slug), en: hrefFor(slug, 'en') } } } : {}), openGraph: { title: `${title} | Find Your Flow`, description, locale: locale === 'en' ? 'en_GB' : 'de_DE', type: 'website' } };
}
