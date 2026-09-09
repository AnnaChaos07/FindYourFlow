'use client';
import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import api from '../axiosClient';
import useSiteContent from '../useSiteContent';
import SiteLink from './SiteLink';

export default function Layout({ children }) {
  const content = useSiteContent();
  const pathname = usePathname();
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { api.get('/api/courses').then(({ data }) => setCourses(data)).catch(() => {}); }, [pathname, content]);
  useEffect(() => { setExpanded(false); }, [pathname]);
  useEffect(() => {
    if (['/admin', '/seite', '/impressum', '/datenschutz'].some(path => pathname.startsWith(path))) return;
    const title = pathname.startsWith('/ueber-mich') ? content.aboutTitle : pathname.startsWith('/kontakt') ? content.contactTitle : content.siteName;
    document.title = title === content.siteName ? title : `${title} | ${content.siteName}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', content.siteDescription);
  }, [content, pathname]);
  function renderMenu(items, footer = false) {
    return items.filter(item => item.visible).map(item => {
      const children = item.type === 'courses' ? courses.map(course => ({ id: String(course.id), type: 'link', label: course.title, href: '/angebote/?slug=' + encodeURIComponent(course.slug), visible: true })) : item.children || [];
      if (item.type === 'group' || item.type === 'courses') {
        if (!children.length) return null;
        return footer ? <div key={item.id}><strong>{item.label}</strong><div className="d-flex flex-wrap gap-3">{renderMenu(children, true)}</div></div> : <NavDropdown key={item.id} title={item.label} id={'nav-' + item.id}>{children.filter(child => child.visible).map(child => <NavDropdown.Item key={child.id} as={SiteLink} href={child.type === 'booking' ? content.bookingUrl : child.href} newTab={child.newTab} onClick={() => setExpanded(false)}>{child.label}</NavDropdown.Item>)}</NavDropdown>;
      }
      const href = item.type === 'booking' ? content.bookingUrl : item.href;
      if (!href) return null;
      return footer ? <SiteLink key={item.id} href={href} newTab={item.newTab} className="footer-link">{item.label}</SiteLink> : <Nav.Link key={item.id} as={SiteLink} href={href} newTab={item.newTab} onClick={() => setExpanded(false)}>{item.label}</Nav.Link>;
    });
  }
  return <div className="site-shell">
    <Navbar expand="lg" sticky="top" expanded={expanded} onToggle={setExpanded} className="main-navbar shadow-sm"><Container>
      <Navbar.Brand as={SiteLink} href="/">{content.siteName}</Navbar.Brand>
      <Navbar.Toggle aria-label={content.menuToggleLabel} aria-controls="main-navigation" />
      <Navbar.Collapse id="main-navigation"><Nav className="ms-auto">{renderMenu(content.navigation)}</Nav></Navbar.Collapse>
    </Container></Navbar>
    <main className="flex-grow-1">{children}</main>
    <footer className="site-footer py-4 mt-5"><Container>
      <p className="mb-2 cms-text">{content.footerText.replaceAll('{year}', String(new Date().getFullYear()))}</p>
      <nav className="d-flex flex-wrap gap-4">{renderMenu(content.footerNavigation, true)}<SiteLink href="/impressum/" className="footer-link">Impressum</SiteLink><SiteLink href="/datenschutz/" className="footer-link">Datenschutz</SiteLink></nav>
    </Container></footer><ToastContainer position="bottom-right" />
  </div>;
}
