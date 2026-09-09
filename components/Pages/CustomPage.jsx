'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Container } from 'react-bootstrap';
import { useSiteState } from '../useSiteContent';
import SiteLink from '../Components/SiteLink';

export function PageBody({ page }) {
  return <>
    {page.eyebrow && <p className="eyebrow">{page.eyebrow}</p>}
    <h1>{page.title}</h1>
    {page.intro && <p className="lead cms-text">{page.intro}</p>}
    {page.sections.map(section => <section className="my-5" key={section.id}>
      {section.title && <h2>{section.title}</h2>}
      {section.image && <img src={section.image} alt={section.imageAlt} className="img-fluid rounded-4 mb-4 cms-section-image" />}
      {section.body && <div className="cms-text mb-3">{section.body}</div>}
      {section.buttonLabel && <SiteLink href={section.buttonHref} className="btn btn-primary">{section.buttonLabel}</SiteLink>}
    </section>)}
  </>;
}
export default function CustomPage() {
  const slug = useSearchParams().get('slug');
  const { content, loading, error } = useSiteState();
  const page = content.pages.find(page => page.slug === slug);
  useEffect(() => {
    if (!page) return;
    document.title = `${page.title} | ${content.siteName}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description || content.siteDescription);
  }, [page, content.siteName, content.siteDescription]);
  return <Container className="py-5">
    {loading ? <p role="status">{content.pageLoadingText}</p> : error ? <Alert variant="warning">{content.pageErrorText}</Alert> : page ? <PageBody page={page} /> : <><h1>{content.notFoundTitle}</h1><p>{content.notFoundText}</p><SiteLink href="/">{content.homeLinkLabel}</SiteLink></>}
  </Container>;
}
