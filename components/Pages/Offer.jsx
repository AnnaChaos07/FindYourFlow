'use client';

import useText from "../Flow/useText";
import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'next/navigation';
import SiteLink from '../Components/SiteLink';
import api from '../axiosClient';
import useSiteContent from '../useSiteContent';
export default function Offer() {
  const tr = useText();
  const slug = useSearchParams().get('slug');
  const content = useSiteContent();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setCourse(null);
    setError(0);
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/api/courses/' + encodeURIComponent(slug), {
      signal: controller.signal
    }).then(({
      data
    }) => setCourse(data)).catch(error => {
      if (!controller.signal.aborted) setError(error.response?.status || 503);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [slug]);
  if (loading) return <div className="text-center py-5" role="status"><Spinner aria-label={content.offerLoadingText} /><p>{tr(content.offerLoadingText)}</p></div>;
  if (!course) return <Container className="py-5"><Alert variant="info">{tr(error === 404 ? content.offerMissingText : error ? content.coursesErrorText : content.offerSelectText)}</Alert><SiteLink href="/">{tr(content.offersBackLabel)}</SiteLink></Container>;
  return <Container className="py-5"><Row className="g-5">
    <Col lg={7}><Badge className="olive-badge">{tr(course.duration)}</Badge><h1 className="display-5 mt-3">{tr(course.title)}</h1><p className="lead cms-text">{tr(course.teaser)}</p><p className="cms-text">{tr(content.offerIntro)}</p>{tr(course.description && <div className="cms-text">{tr(course.description)}</div>)}</Col>
    <Col lg={5}><Card className="border-0 shadow-sm"><Card.Body className="p-4">
      <h2 className="h4">{tr(content.bookingTitle)}</h2><p className="fs-3">{tr(Number(course.price).toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
              }))}</p>
      {tr(course.bookingUrl ? <><p className="cms-text">{tr(content.bookingText)}</p><SiteLink href={course.bookingUrl} newTab className="btn btn-primary">{tr(content.bookingButtonLabel)}</SiteLink></> : <><p className="cms-text">{tr(content.bookingUnavailableText)}</p><SiteLink href={content.bookingContactHref} className="btn btn-primary">{tr(content.bookingContactLabel)}</SiteLink></>)}
    </Card.Body></Card></Col>
  </Row></Container>;
}
