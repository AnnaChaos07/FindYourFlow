// Imported only by next dev AND NEXT_PUBLIC_FLOW_FIXTURES=true.
// Year 2026 is a DEVELOPMENT assumption: source dates did not contain a year.
// These records are rejected by CMS validation and never auto-persisted.
const event = (id, category, title, start, end, location, duration, price, theme = '') => ({ id: 'fixture-' + id, developmentOnly: true, published: true, category, title, start, end, location, duration, price, theme, bookingUrl: '' });
export const fixtures = {
  eventsJson: [
    event('prenatal-une','praenatal','Pränatal Yoga','2026-10-06T16:30:00+02:00','2026-10-06T17:30:00+02:00','Unë','8 Termine',165),
    event('prenatal-mysenses','praenatal','Pränatal Yoga','2026-10-30T15:00:00+01:00','2026-10-30T16:00:00+01:00','MySenses','8 Termine',165),
    event('postnatal-une','postnatal','Postnatal Yoga','2026-10-08T13:00:00+02:00','2026-10-08T14:00:00+02:00','Unë','8 Termine',165),
    event('postnatal-mysenses','postnatal','Postnatal Yoga','2026-10-30T13:30:00+01:00','2026-10-30T14:30:00+01:00','MySenses','8 Termine',165),
    // Red Circle has no confirmed time, so it is deliberately not a timed event.
  ],
  classesJson: [
    { id:'fixture-postnatal-flow', developmentOnly:true, published:true, title:'Postnatal Flow',day:'Mittwoch',time:'10:45',location:'MySenses',description:'Yoga und Zeit für dich nach der Geburt.',bookingLabel:'Buchung über USC oder MySenses',bookingUrl:'' },
    { id:'fixture-yin', developmentOnly:true, published:true, title:'Soft Landing Yin',day:'Montag',time:'20:30',location:'MySenses',description:'Ein ruhiger Ausklang mit Yin Yoga.',bookingLabel:'Buchung über USC oder MySenses',bookingUrl:'' },
  ],
  testimonialsJson: [
    { id:'fixture-alina', developmentOnly:true, published:true,name:'Alina S.',context:'Yoga & Zyklusberatung',contexts:['home','zyklusberatung'],quote:'Ich habe bislang Yoga und Zyklusberatung mit Anna gemacht und bin immer wieder total begeistert. Anna schafft in jeder Stunde eine einzigartige Atmosphäre der Ruhe. Egal wie verkopft oder gestresst ich bei ihr ankomme, ich gehe jedes Mal mit einem Gefühl innerer Ruhe und Gelassenheit. Anna führt mich dabei immer wieder wohlwollend zu mir selbst zurück und ihre super angenehme Stimme ist ein Anker, an dem ich mich gerne festhalte. Ihre Wärme und zugewandte Art machen außerdem, dass ich mich gesehen und wertschätzend gepusht fühle. Das Arbeiten mit Anna ist ein absoluter Gewinn für meinen Alltag – kurz-, mittel- und langfristig.' },
    { id:'fixture-julia', developmentOnly:true,published:true,name:'Julia G.',context:'Postnatal Yoga mit Baby',contexts:['postnatal'],quote:'Ich habe den Postnatal Yogakurs mit Baby bei Anna besucht. Anna schafft einen wunderbaren Raum und eine entspannte Atmosphäre, in der man sich sofort wohl fühlt. Besonders wertvoll fand ich, dass man einfach sein darf – auch wenn das Baby mal unruhig ist oder Aufmerksamkeit braucht. Anna begleitet die Stunde mit Wärme und Verständnis, sodass man als Mama ganz ohne Druck ankommen und in einen individuellen Flow kommen kann. Außerdem habe ich mich nach dem Kurs nicht nur entspannter, sondern auch gestärkt gefühlt. Er ist eine echte Bereicherung in der Zeit nach der Geburt.' },
    { id:'fixture-antje',developmentOnly:true,published:true,name:'Antje H.',context:'Individuelles Yoga',contexts:['individuelles-yoga'],quote:'Anna ist eine tolle Yogalehrerin. Wir arbeiten digital und am Telefon zusammen und sie berät mich super, stellt mir ganz individuell Übungen zusammen, die zu mir passen. Kompetent, herzlich und immer erreichbar. Ich fühle mich bei ihr rundum gut betreut. Absolute Empfehlung!' },
    { id:'fixture-ines',developmentOnly:true,published:true,name:'Ines F.',context:'Hatha & Yin Yoga',contexts:['offene-stunden'],quote:'Der Unterricht bei Anna ist eine absolute Herzensempfehlung. Durch ihre wunderbar authentische und herzliche Art kreiert sie ab der ersten Minute eine vertrauensvolle, positive Atmosphäre, in der man sofort ankommen und den Alltag hinter sich lassen kann. Ob in den kraftvollen Hatha-Einheiten oder im tiefen Loslassen beim Yin-Yoga: Man fühlt sich bei ihr menschlich und fachlich rundum sicher und bestens aufgehoben. Die stimmungsvolle Soundbegleitung rundet die Stunden perfekt ab und macht jede Praxis zu einem ganzheitlichen Erlebnis für Körper und Geist. Nach ihren Einheiten gehe ich jedes Mal geerdet, erholt und mit neuer Energie nach Hause.' },
  ],
};
export const unconfirmedCircle = { dateLabel:'08.11. (Jahr bestätigen)', location:'MySenses', theme:'Thema noch offen', duration:'2 Stunden', price:45, time:null };
