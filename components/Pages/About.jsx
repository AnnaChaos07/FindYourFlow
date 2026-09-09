'use client';
import { Col, Container, Row } from 'react-bootstrap';
import useSiteContent from '../useSiteContent';
export default function About() {
  const content = useSiteContent();
  return <Container className="py-5"><Row className="align-items-center g-5">
    <Col md={5}><img src={content.aboutImage || content.heroImage || '/images/anna-yoga.png'} alt={content.aboutImageAlt} className="hero-image img-fluid rounded-4 shadow" /></Col>
    <Col md={7}><p className="eyebrow">{content.aboutEyebrow}</p><h1>{content.aboutTitle}</h1><p className="lead cms-text">{content.aboutText}</p></Col>
  </Row></Container>;
}
