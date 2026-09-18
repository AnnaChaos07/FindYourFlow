'use client';

import useText from "./useText";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import SiteLink from '../Components/SiteLink';
import useSiteContent, { useSiteState } from '../useSiteContent';
import { hrefFor, ui } from '../../lib/flow-content';
import { parseCollection, upcomingEvents } from '../../lib/flow-data';
export function useLocale() {
  return usePathname().startsWith('/en') ? 'en' : 'de';
}
export function ButtonLink({
  href,
  children,
  secondary = false,
  ...props
}) {
  const tr = useText();
  return <SiteLink href={href} className={secondary ? 'flow-button secondary' : 'flow-button'} {...props}>{tr(children)}<span aria-hidden="true">↗</span></SiteLink>;
}
export function Section({
  children,
  className = '',
  id
}) {
  const tr = useText();
  return <section id={id} className={'flow-section ' + className}><div className="flow-container">{tr(children)}</div></section>;
}
export function SectionHeader({
  eyebrow,
  title,
  children
}) {
  const tr = useText();
  return <div className="section-heading">{tr(eyebrow && <p className="eyebrow">{tr(eyebrow)}</p>)}<h2>{tr(title)}</h2>{tr(children)}</div>;
}
export function Photo({
  src,
  alt,
  label = 'Portrait von Anna',
  className = '',
  priority = false
}) {
  const tr = useText();
  return <figure className={'flow-photo ' + className}>{tr(src ? <img src={src} alt={tr(alt || label)} loading={priority ? 'eager' : 'lazy'} width="800" height="1000" /> : <div className="photo-placeholder" role="img" aria-label={tr('Bildplatzhalter:') + ' ' + tr(label)}><span aria-hidden="true" className="placeholder-arch" /><span>{tr("FOTOGRAFIE FOLGT")}<br /><strong>{tr(label)}</strong></span></div>)}</figure>;
}
export function CTA() {
  const tr = useText();
  const locale = useLocale();
  const t = ui[locale];
  return <Section className="final-cta"><p className="eyebrow">{tr("FIND YOUR FLOW")}</p><h2>{tr(locale === 'en' ? 'Where would you like to begin?' : 'Wo möchtest du anfangen?')}</h2><div className="flow-actions"><ButtonLink href={hrefFor('angebote', locale)}>{tr(t.discover)}</ButtonLink><ButtonLink secondary href={hrefFor('kontakt', locale) + '#kennenlernen'}>{tr(locale === 'en' ? 'Book an introductory call' : 'Kennenlerngespräch buchen')}</ButtonLink></div></Section>;
}
export function FAQ({
  items
}) {
  const tr = useText();
  return <Section><SectionHeader eyebrow="GUT ZU WISSEN" title="Deine Fragen" /><div className="flow-faq">{tr(items.map(([q, a]) => <details key={q}><summary>{tr(q)}<span aria-hidden="true">+</span></summary><p>{tr(a)}</p></details>))}</div></Section>;
}
function useCollection(key) {
  const locale = useLocale();
  const content = useSiteContent();
  const [fixtures, setFixtures] = useState(null);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FLOW_FIXTURES === 'true') {
      import('../../lib/fixtures/flow.js').then(data => setFixtures(data.fixtures));
    }
  }, []);
  return {
    items: (fixtures?.[key] || parseCollection(content[key])).map(item => locale === 'en' ? { ...item, ...Object.fromEntries(Object.entries(item).filter(([key,value]) => key.endsWith('En') && value).map(([key,value]) => [key.slice(0,-2), value])) } : item),
    mock: Boolean(fixtures)
  };
}
export function Events({
  category,
  limit,
  heading = 'Aktuelle Termine & Ort'
}) {
  const tr = useText();
  const {
    items,
    mock
  } = useCollection('eventsJson');
  const {
    loading,
    error
  } = useSiteState();
  const locale = useLocale();
  const t = ui[locale];
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const events = now ? upcomingEvents(items, {
    category,
    limit,
    now
  }) : [];
  return <Section id="termine" className="events-section"><div className="section-top"><SectionHeader eyebrow={locale === 'en' ? 'COME TOGETHER' : 'ZEIT FÜR DICH'} title={heading} />{tr(limit && <SiteLink className="text-link" href={hrefFor('termine', locale)}>{tr(t.allDates)} →</SiteLink>)}</div>
    {tr(mock && <p className="fixture-notice">{tr("Lokale Entwicklungsvorschau · unverbindliche Beispieldaten · nicht buchbar")}</p>)}{tr(mock && category === 'red-circle' && <UnconfirmedCircle />)}
    {tr(!events.length && <p role="status">{tr(!mock && loading ? t.loading : !mock && error ? t.dataError : t.emptyDates)}</p>)}
    <div className="event-list">{tr(events.map(event => <EventCard key={event.id} event={event} mock={mock} locale={locale} />))}</div>
  </Section>;
}
export function EventCard({
  event,
  mock = false,
  locale = 'de'
}) {
  const tr = useText();
  const date = new Date(event.start);
  const dateLocale = locale === 'en' ? 'en-GB' : 'de-DE';
  const t = ui[locale];
  return <article className="event-row"><time dateTime={event.start} className="event-date"><strong>{tr(date.toLocaleDateString(dateLocale, {
          day: '2-digit',
          timeZone: 'Europe/Berlin'
        }))}</strong><span>{tr(date.toLocaleDateString(dateLocale, {
          month: 'short',
          year: 'numeric',
          timeZone: 'Europe/Berlin'
        }))}</span></time><div><p className="eyebrow">{tr(event.category === 'red-circle' ? 'FRAUENKREIS' : event.category === 'praenatal' || event.category === 'postnatal' ? 'PRÄVENTIONSKURS' : 'ZUSAMMENKOMMEN')}</p><h3>{tr(event.title)}</h3>{tr(event.theme && <p>{tr(event.theme)}</p>)}<p className="event-meta">{tr(date.toLocaleTimeString(dateLocale, {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Berlin'
        }))}{tr(event.end && '–' + new Date(event.end).toLocaleTimeString(dateLocale, {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Berlin'
        }))}{tr(" Uhr · ")}{tr(event.location)}<br />{tr(event.duration)} · {tr(event.price)} €</p></div><div>{tr(event.bookingUrl && !mock ? <ButtonLink href={event.bookingUrl} newTab>{tr(t.book)}</ButtonLink> : <SiteLink className="text-link" href={hrefFor('kontakt', locale)}>{tr(locale === 'en' ? 'Ask about this date' : 'Zum Termin anfragen')} →</SiteLink>)}</div></article>;
}
export function Testimonials({
  context = 'home'
}) {
  const tr = useText();
  const {
    items,
    mock
  } = useCollection('testimonialsJson');
  const quotes = items.filter(item => item.published && item.contexts?.includes(context));
  if (!quotes.length) return null;
  return <Section className="testimonials"><SectionHeader eyebrow="ERFAHRUNGEN" title="Was bleibt, ist ein Gefühl." />{tr(mock && <p className="fixture-notice">{tr("Lokale Vorschau · Testimonials noch nicht veröffentlicht")}</p>)}<div className="quote-list">{tr(quotes.slice(0, 2).map(item => <figure key={item.id}><span className="quote-mark" aria-hidden="true">“</span><blockquote>{tr(item.quote)}</blockquote><figcaption>{tr(item.name)}<span>{tr(item.context)}</span></figcaption></figure>))}</div></Section>;
}
export function OpenClasses() {
  const tr = useText();
  const {
    items,
    mock
  } = useCollection('classesJson');
  const {
    error,
    loading
  } = useSiteState();
  const t = ui[useLocale()];
  const classes = items.filter(item => item.published);
  return <Section>{tr(mock && <p className="fixture-notice">{tr("Lokale Entwicklungsvorschau · Zeiten noch nicht bestätigt")}</p>)}{tr(!classes.length && <p role="status">{tr(loading ? t.loading : error ? t.dataError : 'Die aktuellen offenen Stunden werden hier veröffentlicht. Schreib mir gern für weitere Informationen.')}</p>)}<div className="class-list">{tr(classes.map(item => <article key={item.id}><p className="eyebrow">{tr(item.day)} · {tr(item.time)}</p><h2>{tr(item.title)}</h2><p>{tr(item.location)}</p><p>{tr(item.description)}</p>{tr(item.bookingUrl && !mock ? <ButtonLink href={item.bookingUrl} newTab>{tr(item.bookingLabel || t.book)}</ButtonLink> : <p>{tr(item.bookingLabel || 'Buchungsinformationen folgen.')}</p>)}</article>))}</div></Section>;
}
export function BookingIntro() {
  const tr = useText();
  const content = useSiteContent();
  const locale = useLocale();
  const en = locale === 'en';
  return <Section id="kennenlernen" className="booking-intro"><SectionHeader eyebrow={en ? 'A FIRST CONVERSATION' : 'EIN ERSTES GESPRÄCH'} title={en ? 'Let’s find out what fits.' : 'Schauen wir, ob es passt.'} /><div className="split-grid">{tr([['Zyklusberatung', content.calendlyCycle, '20 Minuten · kostenlos', 'Anliegen grob verstehen, Erwartungen klären und einander kennenlernen. Keine vollständige Anamnese.'], ['Yoga', content.calendlyYoga, 'Persönlich kennenlernen', 'Erzähl mir, was du dir von deiner Praxis wünschst. Gemeinsam schauen wir nach einem passenden Rahmen.']].map(([title, url, facts, text]) => <article key={title}><h3>{tr(title)}</h3><p className="eyebrow">{tr(facts)}</p><p>{tr(text)}</p>{tr(url ? <><ButtonLink href={url} newTab>{tr(en ? 'Open Calendly' : 'Kennenlerngespräch buchen')}</ButtonLink><p className="small mt-3">{tr(en ? 'Opens Calendly in a new tab.' : 'Öffnet Calendly in einem neuen Tab. Erst dort werden Daten an Calendly übertragen.')}</p></> : <><p>{tr(en ? 'Please send a message to arrange a time.' : 'Vereinbare deinen Kennenlerntermin gern per Nachricht.')}</p><SiteLink className="text-link" href="#nachricht">{tr(ui[locale].message)} →</SiteLink></>)}</article>))}</div></Section>;
}
function UnconfirmedCircle() {
  const tr = useText();
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FLOW_FIXTURES === 'true') import('../../lib/fixtures/flow.js').then(({
      unconfirmedCircle
    }) => setDraft(unconfirmedCircle));
  }, []);
  if (!draft) return null;
  return <article className="event-row"><div className="event-date"><strong>08</strong><span>{tr("November · Entwurf")}</span></div><div><h3>{tr("RED CIRCLE")}</h3><p>{tr(draft.theme)} · {tr(draft.location)}<br />{tr(draft.duration)} · {tr(draft.price)} €</p><p>{tr("Jahr und Uhrzeit werden noch bestätigt.")}</p></div></article>;
}
