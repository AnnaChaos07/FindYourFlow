'use client';
import useSiteContent from '../components/useSiteContent';
import SiteLink from '../components/Components/SiteLink';
export default function NotFound() {
  const content = useSiteContent();
  return <div className="container py-5"><h1>{content.notFoundTitle}</h1><p>{content.notFoundText}</p><SiteLink href="/">{content.homeLinkLabel}</SiteLink></div>;
}
