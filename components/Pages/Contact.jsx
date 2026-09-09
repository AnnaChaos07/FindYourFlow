'use client';
import { useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../axiosClient';
import useSiteContent from '../useSiteContent';
import SiteLink from '../Components/SiteLink';

export default function Contact() {
  const [sending, setSending] = useState(false);
  const content = useSiteContent();
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    try { await api.post('/api/contact', Object.fromEntries(new FormData(form))); toast.success(content.contactSuccessText); form.reset(); }
    catch { toast.error(content.contactErrorText); }
    finally { setSending(false); }
  }
  return <Container className="py-5"><Row className="justify-content-center"><Col lg={7}>
    <h1>{content.contactTitle}</h1><p className="lead cms-text">{content.contactIntro}</p>
    <Form onSubmit={submit} className="content-panel p-4 rounded-4 shadow-sm">
      {[['name', content.contactNameLabel, 120], ['email', content.contactEmailLabel, 180], ['subject', content.contactSubjectLabel, 200]].map(([name, label, maxLength]) => <Form.Group controlId={'contact-' + name} className="mb-3" key={name}><Form.Label>{label}</Form.Label><Form.Control name={name} type={name === 'email' ? 'email' : 'text'} autoComplete={name === 'subject' ? undefined : name} maxLength={maxLength} required /></Form.Group>)}
      <Form.Group controlId="contact-message"><Form.Label>{content.contactMessageLabel}</Form.Label><Form.Control name="message" as="textarea" rows={6} maxLength={10000} required /></Form.Group>
      {content.contactPrivacyText && <p className="small mt-3 cms-text">{content.contactPrivacyText}</p>}
      {content.contactPrivacyHref && <p className="small mt-2"><SiteLink href={content.contactPrivacyHref}>{content.contactPrivacyLabel}</SiteLink></p>}
      <Button className="mt-3" type="submit" disabled={sending}>{sending ? content.contactSendingLabel : content.contactButtonLabel}</Button>
    </Form>
  </Col></Row></Container>;
}
