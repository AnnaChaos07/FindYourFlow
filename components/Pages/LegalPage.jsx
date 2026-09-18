'use client';
import useText from '../Flow/useText';
import { Container } from 'react-bootstrap';
import { PageBody } from './CustomPage';
import useSiteContent from '../useSiteContent';
import { legalPages } from '../../lib/legal-content';

export default function LegalPage({ slug }) {
  const content = useSiteContent();
  const tr = useText();
  const page = content.pages.find(page => page.slug === slug && page.published) || legalPages.find(page => page.slug === slug);
  return <Container className="py-5"><PageBody page={{...page, title: tr(page.title), intro: tr(page.intro), sections: page.sections.map(section => ({...section, title: tr(section.title), body: tr(section.body)}))}} /></Container>;
}
