'use client';
import { useEffect, useState } from 'react';
import { Alert, Card, Col, Container, Row } from 'react-bootstrap';
import SiteLink from '../Components/SiteLink';
import api from '../axiosClient';
import useSiteContent from '../useSiteContent';

export default function Home() {
  const content = useSiteContent();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    api.get('/api/courses', { signal: controller.signal }).then(({ data }) => { setCourses(data); setError(false); }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [content]);
  return <>
    <section className="hero-section py-5"><Container><Row className="align-items-center g-5">
      <Col lg={7}><p className="eyebrow">{content.heroEyebrow}</p><h1 className="display-3 fw-semibold">{content.heroTitle}</h1><p className="lead my-4 cms-text">{content.heroText}</p>
        {content.heroButtonLabel && <SiteLink href={content.heroButtonHref} className="btn btn-primary btn-lg">{content.heroButtonLabel}</SiteLink>}
      </Col><Col lg={5}><img src={content.heroImage || '/images/anna-yoga.png'} alt={content.heroImageAlt} className="hero-image img-fluid rounded-4 shadow" /></Col>
    </Row></Container></section>
    <Container className="py-5"><h2 className="text-center mb-4">{content.homeCoursesTitle}</h2>
      {error && <Alert variant="warning">{content.coursesErrorText}</Alert>}
      {!loading && !error && !courses.length && <p>{content.coursesEmptyText}</p>}
      <Row className="g-4">{courses.map(course => <Col md={6} lg={4} key={course.id}><Card className="h-100 border-0 shadow-sm"><Card.Body className="p-4">
        <Card.Title>{course.title}</Card.Title><Card.Text className="cms-text">{course.teaser}</Card.Text><p className="olive-text small fw-semibold">{course.duration}</p>
        <SiteLink href={'/angebote/?slug=' + encodeURIComponent(course.slug)} className="btn btn-outline-primary">{content.courseButtonLabel}</SiteLink>
      </Card.Body></Card></Col>)}</Row>
    </Container>
  </>;
}
