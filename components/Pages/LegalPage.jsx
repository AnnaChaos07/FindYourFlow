'use client';
import { Container } from 'react-bootstrap';
import { PageBody } from './CustomPage';
import useSiteContent from '../useSiteContent';
import { legalPages } from '../../lib/legal-content';

export default function LegalPage({ slug }) {
  const content = useSiteContent();
  const page = content.pages.find(page => page.slug === slug && page.published) || legalPages.find(page => page.slug === slug);
  return <Container className="py-5"><PageBody page={page} /></Container>;
}
