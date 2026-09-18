'use client';

import useText from "../Flow/useText";
import { useEffect, useRef, useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import api from '../axiosClient';
import useSiteContent from '../useSiteContent';
import SiteLink from './SiteLink';
import { offerLinks, hrefFor, ui } from '../../lib/flow-content';
export default function Layout({
  children
}) {
  const tr = useText();
  const content = useSiteContent();
  const pathname = usePathname();
  const locale = pathname.startsWith('/en') ? 'en' : 'de';
  const t = ui[locale];
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const offersRef = useRef(null);
  const toggleRef = useRef(null);
  const burgerRef = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    api.get('/api/courses', {
      signal: controller.signal
    }).then(({
      data
    }) => setCourses(data)).catch(() => {});
    return () => controller.abort();
  }, [content]);
  useEffect(() => {
    setExpanded(false);
    setOffersOpen(false);
    document.documentElement.lang = locale;
  }, [pathname, locale]);
  useEffect(() => {
    function close(e) {
      if (e.type === 'keydown' && e.key === 'Escape') {
        if (offersOpen) {
          setOffersOpen(false);
          toggleRef.current?.focus();
        } else if (expanded) {
          setExpanded(false);
          burgerRef.current?.focus();
        }
      } else if (e.type === 'pointerdown' && !offersRef.current?.contains(e.target)) setOffersOpen(false);
    }
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
    };
  }, [offersOpen, expanded]);
  const route = pathname.replace(/^\/en(?=\/|$)/, '').replace(/^\/+|\/+$/g, '');
  const localizedHref = href => locale === 'en' && ['/', '/ueber-mich/', '/angebote/', '/termine/', '/kontakt/', '/kontakt/#kennenlernen'].includes(href) ? '/en' + href : href;
  const name = item => locale === 'en' ? {
    home: t.home,
    about: t.about,
    courses: t.offers,
    dates: t.dates,
    contact: t.contact,
    booking: t.meet
  }[item.id] || item.label : item.label;
  function renderMenu(items, footer = false) {
    return items.filter(item => item.visible).map(item => {
      if (item.type === 'courses' && !footer) return <div className="offer-nav" key={item.id} ref={offersRef} onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOffersOpen(false);
      }}><div className="offer-nav-heading"><SiteLink href={hrefFor('angebote', locale)} className="nav-link" onClick={() => setExpanded(false)}>{tr(name(item))}</SiteLink><button ref={toggleRef} type="button" className="offer-toggle" aria-label={locale === 'en' ? 'Show offerings' : 'Angebotsmenü öffnen'} aria-expanded={offersOpen} aria-controls="offer-menu" onClick={() => setOffersOpen(!offersOpen)}><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div><div id="offer-menu" className="offer-dropdown" hidden={!offersOpen}>{tr(offerLinks.map(([slug, label, descriptor, en, descriptorEn]) => <SiteLink key={slug} href={hrefFor(slug, locale)} onClick={() => {
            setExpanded(false);
            setOffersOpen(false);
          }}><strong>{tr(locale === 'en' ? en : label)}</strong><span>{tr(locale === 'en' ? descriptorEn : descriptor)}</span></SiteLink>))}{tr(courses.filter(c => !offerLinks.some(([slug]) => slug === c.slug)).map(c => <SiteLink key={c.id} href={hrefFor('angebote', locale) + '?slug=' + encodeURIComponent(c.slug)} onClick={() => {
            setExpanded(false);
            setOffersOpen(false);
          }}>{tr(c.title)}</SiteLink>))}</div></div>;
      if (item.type === 'group') return footer ? <div key={item.id}><strong>{tr(name(item))}</strong>{tr(renderMenu(item.children || [], true))}</div> : <NavDropdown key={item.id} title={name(item)} id={'nav-' + item.id}>{tr((item.children || []).filter(c => c.visible).map(c => <NavDropdown.Item as={SiteLink} key={c.id} href={c.type === 'booking' ? content.bookingUrl : c.href} newTab={c.newTab} onClick={() => setExpanded(false)}>{tr(c.label)}</NavDropdown.Item>))}</NavDropdown>;
      const href = item.type === 'booking' ? content.bookingUrl : item.type === 'courses' ? '/angebote/' : item.href;
      if (!href) return null;
      return <SiteLink key={item.id} href={localizedHref(href)} newTab={item.newTab} className={footer ? 'footer-link' : item.id === 'booking' ? 'nav-link nav-cta' : 'nav-link'} aria-current={pathname === localizedHref(href) ? 'page' : undefined} onClick={() => setExpanded(false)}>{tr(name(item))}</SiteLink>;
    });
  }
  return <div className="site-shell"><a className="skip-link" href="#main-content">{tr(t.skip)}</a><Navbar expand="lg" sticky="top" expanded={expanded} onToggle={setExpanded} className="main-navbar"><Container className="flow-container"><Navbar.Brand as={SiteLink} href={hrefFor('', locale)}>{tr(content.siteName)}<span>{tr("DEIN KÖRPER. DEIN RHYTHMUS. DEIN WEG.")}</span></Navbar.Brand><Navbar.Toggle ref={burgerRef} label={locale === 'de' ? content.menuToggleLabel : t.menu} aria-expanded={expanded} aria-controls="main-navigation" /><Navbar.Collapse id="main-navigation"><Nav className="ms-auto align-items-lg-center">{tr(renderMenu(content.navigation))}<div className="language-switch" aria-label={locale === 'en' ? 'Language' : 'Sprache'}><SiteLink href={hrefFor(route)} hrefLang="de" aria-current={locale === 'de' ? 'true' : undefined}>{tr("DE")}</SiteLink><span aria-hidden="true">/</span><SiteLink href={hrefFor(route === 'admin' || route === 'seite' ? '' : route, 'en')} hrefLang="en" aria-current={locale === 'en' ? 'true' : undefined}>{tr("EN")}</SiteLink></div></Nav></Navbar.Collapse></Container></Navbar>
    <main id="main-content" tabIndex={-1} className="flex-grow-1">{tr(children)}</main><footer className="site-footer"><div className="flow-container"><div className="footer-top"><div><p className="footer-brand">{tr("Find Your Flow")}</p><p>{tr("Dein Körper. Dein Rhythmus. Dein Weg.")}</p><p>{tr("Räume für Frauengesundheit,")}<br />{tr("Körperwissen und Verbindung.")}</p></div><nav aria-label="Footer"><SiteLink href={hrefFor('ueber-mich', locale)}>{tr(t.about)}</SiteLink><SiteLink href={hrefFor('angebote', locale)}>{tr(t.offers)}</SiteLink><SiteLink href={hrefFor('termine', locale)}>{tr(t.dates)}</SiteLink><SiteLink href={hrefFor('kontakt', locale)}>{tr(t.contact)}</SiteLink>{tr(content.instagramUrl && <SiteLink href={content.instagramUrl} newTab>{tr("Instagram ↗")}</SiteLink>)}{tr(renderMenu(content.footerNavigation, true))}</nav></div><div className="footer-bottom"><p>{tr(content.footerText.replaceAll('{year}', String(new Date().getFullYear())))}</p><nav aria-label={locale === "en" ? "Legal" : "Rechtliches"}><SiteLink href={hrefFor("impressum", locale)}>{tr("Impressum")}</SiteLink><SiteLink href={hrefFor("datenschutz", locale)}>{tr("Datenschutz")}</SiteLink><SiteLink href={hrefFor("agb", locale)}>{tr("AGB")}</SiteLink></nav></div></div></footer><ToastContainer position="bottom-right" /></div>;
}
