'use client';

import useText from "./useText";
import { Suspense, useState } from 'react';
import SearchValue from './SearchValue';
import useSiteContent from '../useSiteContent';
import SiteLink from '../Components/SiteLink';
import LegacyOffer from '../Pages/Offer';
import { pages, principles, worlds, offerLinks, hrefFor, prices, ui } from '../../lib/flow-content';
import { Section, SectionHeader, Photo, CTA, ButtonLink, FAQ, Events, Testimonials, OpenClasses, useLocale } from './Shared';
const imageKeys = {
  zyklusberatung: 'cycleImage',
  'individuelles-yoga': 'yogaImage',
  'red-circle': 'circleImage',
  praenatal: 'prenatalImage',
  postnatal: 'postnatalImage'
};
const aboutIntro = 'Yoga war mein Einstieg in die Arbeit mit Körper und Wahrnehmung. Heute geht es für mich um mehr: Frauengesundheit, Zyklus, Körperwissen – und die Frage, wie wir unseren Körper besser verstehen können, ohne ihn zum nächsten Selbstoptimierungsprojekt zu machen.';
export function LanguageNotice() { return null; }
export function HomePage() {
  const tr = useText();
  const c = useSiteContent();
  const locale = useLocale();
  const t = ui[locale];
  return <><section className="flow-hero"><div className="flow-container hero-grid"><div className="hero-copy"><p className="eyebrow">{tr(c.heroEyebrow)}</p><h1 className="cms-text">{tr(c.heroTitle)}</h1><p className="hero-intro">{tr(c.heroText)}</p><div className="flow-actions"><ButtonLink href={locale === 'de' ? c.heroButtonHref : hrefFor('angebote', locale)}>{tr(c.heroButtonLabel)}</ButtonLink><SiteLink href={hrefFor('termine', locale)} className="text-link">{tr(locale === 'en' ? 'Current courses & dates' : 'Aktuelle Kurse & Termine')} →</SiteLink></div><p className="hero-location">{tr("BERLIN & ONLINE ")}<span aria-hidden="true">—</span>{tr(" MIT ANNA BAUMBACH")}</p></div><div className="hero-visual"><Photo src={c.heroImage} alt={c.heroImageAlt} priority /><span className="hero-caption">{tr("Raum, du selbst zu sein.")}</span></div></div></section>
    <LanguageNotice /><div lang={useLocale()}><Section className="worlds-section"><SectionHeader eyebrow="BEI DIR BEGINNEN" title="Was brauchst du gerade?" /><Worlds compact /></Section>
    <Events limit={3} heading="Aktuell bei mir" />
    <Section className="about-teaser"><div className="split-grid"><Photo src={c.aboutImage || c.heroImage} alt={c.aboutImageAlt} label="Persönliches Portrait von Anna" /><div><p className="eyebrow">{tr("MENSCHLICH. ZUGEWANDT. AUF AUGENHÖHE.")}</p><h2>{tr("Hi, ich bin Anna.")}</h2><p>{tr(aboutIntro)}</p><p>{tr("Ich begleite dich warm, individuell und fundiert. Mit offenem Ohr und ohne die Behauptung, ein Patentrezept für alle zu haben.")}</p><SiteLink className="text-link" href={hrefFor('ueber-mich', locale)}>{tr("Mehr über mich →")}</SiteLink></div></div></Section>
    <Principles /><Testimonials /></div><CTA /></>;
}
export function Worlds({
  compact = false
}) {
  const tr = useText();
  const locale = useLocale();
  const c = useSiteContent();
  const images = [c.cycleImage, c.yogaImage, c.circleImage];
  return <div className={compact ? 'worlds-grid' : 'offer-worlds'}>{tr(worlds.map((world, i) => <article className={'world world-' + i} key={world.label}>{tr((!compact || images[i]) && <Photo src={images[i]} label={world.image} />)}<div><span className="world-number">0{tr(i + 1)}</span><p className="eyebrow">{tr(world.label)}</p>{tr(compact ? <h3>{tr(world.title)}</h3> : <h2>{tr(world.title)}</h2>)}<p>{tr(world.text)}</p>{tr((compact ? world.links.slice(0, 1) : world.links).map(slug => <SiteLink key={slug} href={hrefFor(slug, locale)} className="text-link">{tr(compact ? 'Mehr erfahren' : offerLinks.find(item => item[0] === slug)?.[1])} →</SiteLink>))}</div></article>))}</div>;
}
export function Principles() {
  const tr = useText();
  return <Section className="principles"><SectionHeader eyebrow="MEIN ANSATZ" title="Dein Körper arbeitet nicht gegen dich." /><div className="principle-grid">{tr(principles.map(([title, text], i) => <article key={title}><span>0{tr(i + 1)}</span><h3>{tr(title)}</h3><p>{tr(text)}</p></article>))}</div></Section>;
}
export function OffersPage() {
  const tr = useText();
  const [slug, setSlug] = useState(null);
  return <>
    <Suspense fallback={null}><SearchValue name="slug" onChange={setSlug} /></Suspense>
    {tr(slug ? <Suspense fallback={<p role="status">{tr("Angebot wird geladen …")}</p>}><LegacyOffer /></Suspense> : <>
      <PageHero eyebrow="ANGEBOTE" title="Wie möchtest du mit mir arbeiten?" intro="Verstehen, bewegen, verbinden. Unterschiedliche Wege – und Raum für das, was du gerade brauchst." />
      <Section><Worlds /></Section><CTA />
    </>)}
  </>;
}
export function PageHero({
  eyebrow,
  title,
  subtitle,
  intro,
  image,
  src,
  alt,
  children
}) {
  const tr = useText();
  return <><LanguageNotice /><section className="page-hero" lang={useLocale()}><div className={'flow-container ' + (image ? 'hero-grid' : 'narrow')}><div><p className="eyebrow">{tr(eyebrow)}</p><h1>{tr(title)}</h1>{tr(subtitle && <p className="hero-subtitle">{tr(subtitle)}</p>)}<p className="hero-intro">{tr(intro)}</p>{tr(children)}</div>{tr(image && <Photo src={src} alt={alt} label={image} />)}</div></section></>;
}
export function DetailPage({
  slug
}) {
  const tr = useText();
  const c = useSiteContent();
  const page = pages[slug];
  const locale = useLocale();
  const prevention = ['praenatal', 'postnatal'].includes(slug);
  const direct = prevention || slug === 'red-circle';
  return <><PageHero {...page} image={page.image} src={c[imageKeys[slug]]}><div className="flow-actions"><ButtonLink href={direct ? '#termine' : hrefFor('kontakt', locale) + '#kennenlernen'}>{tr(direct ? 'Termine entdecken' : 'Kostenlos kennenlernen')}</ButtonLink></div>{tr(page.price && <p className="hero-facts"><strong>{tr(page.price)}</strong> · {tr(page.facts)}</p>)}</PageHero>
    <div lang={useLocale()}><Section><div className="editorial-sections">{tr(page.sections.map(([title, text]) => <article key={title}><h2>{tr(title)}</h2><p>{tr(text)}</p></article>))}</div></Section>
    {tr(page.steps && <Section className="steps-section"><SectionHeader eyebrow="DEINE BEGLEITUNG" title="Schritt für Schritt. In deinem Rhythmus." /><div className="steps-grid">{tr(page.steps.map(([n, title, text]) => <article key={n}><span className="step-number">{tr(n)}</span><h3>{tr(title)}</h3><p>{tr(text)}</p></article>))}</div><p className="service-note">{tr(page.note)}</p></Section>)}
    {tr(slug === 'zyklusberatung' && <Section><SectionHeader eyebrow="WEITERE MÖGLICHKEITEN" title="So viel Begleitung, wie du brauchst." /><div className="split-grid"><PriceOffer title="Zyklus Check-in" subtitle="Raum für deine konkrete Frage" price={prices.checkin} facts="60 Minuten" text="Für dich, wenn du deinen Zyklus schon gut kennst, ein konkretes Thema besprechen möchtest und aktuell keine umfassende Begleitung brauchst." /><PriceOffer title="Follow-up" subtitle="Für bestehende Find-Your-Cycle-Klientinnen" price={prices.followup} facts="60 Minuten · individuelle Abstände" text="Veränderung folgt keinem festen Zeitplan. Nach den ersten drei Terminen entscheiden wir gemeinsam, ob und in welchem Abstand weitere Begleitung sinnvoll ist." /></div></Section>)}
    {tr(slug === 'individuelles-yoga' && <Section className="pricing-section"><SectionHeader eyebrow="DEIN PASSENDER RAHMEN" title="Allein. Zusammen. Im Arbeitsalltag." /><p>{tr("Die folgenden Preise sind der aktuelle Planungsstand. Den verbindlichen Gesamtpreis vereinbaren wir vorab.")}</p><div className="price-grid"><PriceOffer title="Yoga 1:1" price={prices.yoga} facts="60 Minuten" text={tr('Einzeln oder als Begleitung: 5 × 60 Minuten, Planungswert ') + prices.yogaFive + tr('. Ggf. zuzüglich Raum und Anfahrt.')} /><PriceOffer title="Private Gruppen" price={prices.group} facts="60 Minuten" text="Für Freund:innen, Geburtstage, JGA, Prenatal-Gruppen, private Kleingruppen und besondere Anlässe. Ggf. zuzüglich Raum und Anfahrt." label="Private Yogastunde anfragen" topic="Sonstiges" /><PriceOffer title="Firmenyoga" price="Auf Anfrage" facts="Berlin · ggf. online" text="Regelmäßige Stunden, einzelne Sessions und Entspannungsformate für den Arbeitsalltag." label="Firmenyoga anfragen" topic="Firmenyoga" /></div></Section>)}
    {tr(direct && <Events category={slug} />)}
    {tr(prevention && <><Section className="subsidy"><p className="eyebrow">{tr("RAUM FÜR VORSORGE")}</p><h2>{tr("Bewegung, die unterstützt wird.")}</h2><p>{tr("8 Termine · zertifizierter Präventionskurs nach §20 SGB V · ")}{tr(prices.prevention)}</p><p>{tr("Eine Bezuschussung durch deine Krankenkasse ist möglich. Erkundige dich vorab nach Höhe und Voraussetzungen. Eine Erstattung ist nicht garantiert.")}</p></Section><Section><div className="narrow"><h2>{tr("Mit Anna an deiner Seite.")}</h2><p>{tr("Ich begleite dich mit Wärme und Aufmerksamkeit für deine Lebensphase. Pausen und individuelle Anpassungen sind Teil der Praxis.")}</p><SiteLink href={hrefFor('ueber-mich', locale)} className="text-link">{tr("Mehr über mich →")}</SiteLink></div></Section></>)}
    <Testimonials context={slug} /><FAQ items={page.faq} /></div>{tr(direct ? <Section className="final-cta"><h2>{tr("Ein Platz für dich.")}</h2><ButtonLink href="#termine">{tr("Aktuelle Termine & Buchung")}</ButtonLink></Section> : <CTA />)}</>;
}
function PriceOffer({
  title,
  subtitle,
  price,
  facts,
  text,
  label = 'Kennenlerngespräch buchen',
  topic
}) {
  const tr = useText();
  const locale = useLocale();
  return <article className="price-offer"><h3>{tr(title)}</h3>{tr(subtitle && <p>{tr(subtitle)}</p>)}<p className="price">{tr(price)}</p><p className="eyebrow">{tr(facts)}</p><p>{tr(text)}</p><ButtonLink secondary href={hrefFor('kontakt', locale) + (topic ? '?thema=' + encodeURIComponent(topic) + '#nachricht' : '#kennenlernen')}>{tr(label)}</ButtonLink></article>;
}
export function PreventionPage() {
  const tr = useText();
  const locale = useLocale();
  const c = useSiteContent();
  return <><PageHero eyebrow="YOGA & PRÄVENTION" title="Hatha Yoga Präventionskurse" subtitle="Bewegung für deine Lebensphase." intro="Ein fester Rahmen, um bei dir anzukommen. Mit bewusster Bewegung, Körperwahrnehmung und Entspannung." /><Section><p className="course-certification">{tr("8 Termine · zertifizierter Präventionskurs nach §20 SGB V · Bezuschussung durch die Krankenkasse möglich")}</p><div className="split-grid">{tr(['praenatal', 'postnatal'].map(slug => <article key={slug} className="course-feature"><Photo src={c[imageKeys[slug]]} label={pages[slug].image} /><h2>{tr(pages[slug].title)}</h2><p>{tr(pages[slug].intro)}</p><p>{tr(prices.prevention)}{tr(" · 8 Termine")}</p><ButtonLink href={hrefFor(slug, locale)}>{tr("Mehr erfahren")}</ButtonLink></article>))}</div></Section><CTA /></>;
}
export function AboutPage() {
  const tr = useText();
  const c = useSiteContent();
  return <><PageHero eyebrow="ÜBER MICH" title={c.aboutTitle} subtitle="Ich begleite dich. Deinen Körper. Deinen Weg." intro={c.aboutText} image="Persönliches Portrait von Anna" src={c.aboutImage || c.heroImage} alt={c.aboutImageAlt} /><div lang={useLocale()}><Section><div className="editorial-sections"><article><h2>{tr("Frauengesundheit verdient Raum.")}</h2><p>{tr("Ich bin selbst eine Frau. Mich beschäftigt, unter welchen gesellschaftlichen und strukturellen Bedingungen Frauen leben und Gesundheit erfahren. Ich möchte Räume schaffen, in denen Frauengesundheit ernst genommen und sichtbarer wird. Und ich bin selbst neugierig auf meinen Körper und meine Gesundheit.")}</p></article><article><h2>{tr("Du brauchst kein neues Selbstoptimierungsprojekt.")}</h2><p>{tr("Generische Lösungen, immer neue Produkte und Patentrezepte werden individuellen Erfahrungen oft nicht gerecht. Ich habe nicht alle Antworten und kann nicht jedes Problem lösen. Aber ich möchte dich darin unterstützen, deinen Körper besser zu verstehen und deiner eigenen Wahrnehmung wieder mehr zu vertrauen.")}</p></article><article><h2>{tr("Mein Weg: vom Yoga zum Körperwissen.")}</h2><p>{tr("Yoga war der Anfang. Aus der Arbeit mit Bewegung und Wahrnehmung wuchs mein Interesse an Körperwissen, Zyklus und Frauengesundheit. Heute verbinden sich diese Bereiche in meiner Arbeit. Yoga bleibt ein wichtiger Teil davon.")}</p></article><article><h2>{tr("Meine Arbeit heute.")}</h2><p>{tr("Ich begleite Menschen mit Zyklusberatung, Yoga und Präventionskursen in Berlin und online. Meine Angebote richten sich an Frauen und FLINTA-Personen – je nach Format und Lebensphase. Mit Red Circle schaffe ich bewusst einen Frauenraum für ehrlichen Austausch und Verbindung.")}</p></article></div></Section><Principles /><Section><SectionHeader eyebrow="LERNEN BLEIBT TEIL MEINES WEGES" title="Wissen & Qualifikationen" /><div className="qualification-list">{tr(['Yoga-Ausbildungen', 'Prä- und Postnatal', 'Zyklus & Frauengesundheit', 'Weitere Fortbildungen'].map(title => <div key={title}><h3>{tr(title)}</h3><p>{tr("Die Angaben zu Ausbildung, Institut und Abschluss werden ergänzt.")}</p></div>))}<div><h3>{tr("Heilpraktikerin in Ausbildung")}</h3><p>{tr("Laufende Ausbildung. Keine bestehende Heilpraktikererlaubnis und kein heilpraktisches Behandlungsangebot.")}</p></div></div></Section><Section className="personal-note"><h2>{tr("Auch ich bin unterwegs.")}</h2><p>{tr("Meinen eigenen Körper kennenzulernen bleibt ein persönlicher Weg. Ich bringe Neugier mit – und die Überzeugung, dass wir nicht alles allein herausfinden müssen.")}</p></Section></div><CTA /></>;
}
export function DatesPage() {
  const tr = useText();
  return <><PageHero eyebrow="BERLIN · GEMEINSAME ZEIT" title="Termine" intro="Kursstarts, Frauenkreise und besondere Begegnungen. Hier findest du die nächsten Möglichkeiten, dabei zu sein." /><Events heading="Was als Nächstes ansteht" /><CTA /></>;
}
export function ClassesPage() {
  const tr = useText();
  return <><PageHero eyebrow="YOGA IN BERLIN" title="Offene Stunden" subtitle="Ankommen. Bewegen. Durchatmen." intro="Eine kleine Pause vom Alltag. Hier findest du meine offenen Stunden und den jeweiligen Buchungsweg." /><OpenClasses /><Testimonials context="offene-stunden" /><CTA /></>;
}
export function TermsPage() {
  const tr = useText();
  const c = useSiteContent();
  const page = c.pages.find(p => p.slug === 'agb' && p.published);
  return <><PageHero eyebrow="RECHTLICHES" title="AGB" intro={page?.intro || 'Die Allgemeinen Geschäftsbedingungen werden hier ergänzt.'} /><Section>{tr(page ? page.sections.map(s => <article key={s.id}><h2>{tr(s.title)}</h2><p className="cms-text">{tr(s.body)}</p></article>) : <p>{tr("Für externe Buchungen werden dir die geltenden Bedingungen beim jeweiligen Buchungsanbieter vor Vertragsabschluss angezeigt. Bei Fragen zu einer individuellen Vereinbarung schreib mir bitte vorab.")}</p>)}</Section></>;
}
