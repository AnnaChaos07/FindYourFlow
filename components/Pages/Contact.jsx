'use client';

import useText from "../Flow/useText";
import { Suspense, useCallback, useState } from 'react';
import SearchValue from '../Flow/SearchValue';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../axiosClient';
import useSiteContent from '../useSiteContent';
import SiteLink from '../Components/SiteLink';
import { Section, BookingIntro, useLocale } from '../Flow/Shared';
import { PageHero } from '../Flow/Pages';
const topics = ['Zyklusberatung', 'Yoga 1:1', 'Firmenyoga', 'Präventionskurs', 'Red Circle', 'Sonstiges'];
export default function Contact() {
  const tr = useText();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [topic, setTopic] = useState('');
  const content = useSiteContent();
  const en = useLocale() === 'en';
  const selectTopic = useCallback(value => {
    if (topics.includes(value)) setTopic(value);
  }, []);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setResult('');
    try {
      const data = Object.fromEntries(new FormData(form));
      data.privacyConsent = data.privacyConsent === 'on';
      await api.post('/api/contact', data);
      toast.success(tr(content.contactSuccessText));
      setResult(tr(content.contactSuccessText));
      form.reset();
      setTopic('');
    } catch {
      toast.error(tr(content.contactErrorText));
      setResult(tr(content.contactErrorText));
    } finally {
      setSending(false);
    }
  }
  return <><Suspense fallback={null}><SearchValue name="thema" onChange={selectTopic} /></Suspense><PageHero eyebrow={en ? 'CONTACT' : 'KONTAKT'} title={en ? 'Let’s get to know each other.' : content.contactTitle} intro={en ? 'There is no perfect place to start. Tell me what is on your mind.' : 'Du musst noch nicht genau wissen, wo du anfangen möchtest. Erzähl mir, was dich beschäftigt.'} /><BookingIntro /><Section id="nachricht"><div className="contact-grid"><div><p className="eyebrow">{tr("IM GESPRÄCH BEGINNT VERBINDUNG")}</p><h2>{tr(en ? 'Send a message.' : 'Schreib mir.')}</h2><p>{tr(content.contactIntro)}</p>{tr(content.publicEmail && <p><a className="text-link" href={'mailto:' + content.publicEmail}>{tr(content.publicEmail)}</a></p>)}{tr(content.instagramUrl && <SiteLink className="text-link" href={content.instagramUrl} newTab>{tr("Instagram ↗")}</SiteLink>)}<p className="small mt-4">{tr(en ? 'For private groups and corporate yoga, please use this form.' : 'Für private Gruppen und Firmenyoga kannst du direkt dieses Formular nutzen.')}</p></div><Form onSubmit={submit} className="contact-form" aria-busy={sending}>
    {tr([['name', en ? 'Name' : content.contactNameLabel, 120], ['email', en ? 'Email' : content.contactEmailLabel, 180]].map(([name, label, maxLength]) => <Form.Group controlId={'contact-' + name} className="mb-3" key={name}><Form.Label>{tr(label)}</Form.Label><Form.Control name={name} type={name === 'email' ? 'email' : 'text'} autoComplete={name} maxLength={maxLength} required /></Form.Group>))}
    <Form.Group controlId="contact-subject" className="mb-3"><Form.Label>{tr(en ? 'Topic' : content.contactSubjectLabel)}</Form.Label><Form.Select name="subject" required value={topic} onChange={e => setTopic(e.target.value)}><option value="">{tr(en ? 'Please select' : 'Bitte auswählen')}</option>{tr(topics.map(t => <option key={t} value={t}>{tr(t)}</option>))}</Form.Select></Form.Group>
    <Form.Group controlId="contact-message"><Form.Label>{tr(en ? 'Message' : content.contactMessageLabel)}</Form.Label><Form.Control name="message" as="textarea" rows={6} maxLength={10000} required /></Form.Group>
    <Form.Check id="contact-privacy" name="privacyConsent" required label={<>{tr(en ? 'I have read the ' : 'Ich habe die ')}<SiteLink href={en ? "/en/datenschutz/" : "/datenschutz/"}>{tr(en ? 'privacy information' : 'Datenschutzhinweise')}</SiteLink>{tr(en ? ' and agree to the processing of my details to respond to this message.' : ' gelesen und stimme der Verarbeitung meiner Angaben zur Beantwortung der Anfrage zu.')}</>} />
    {tr(content.contactPrivacyText && <p className="small cms-text">{tr(content.contactPrivacyText)}</p>)}<Button type="submit" disabled={sending}>{tr(sending ? en ? 'Sending …' : content.contactSendingLabel : en ? 'Send message' : content.contactButtonLabel)}</Button><p className="mt-3" role="status" aria-live="polite">{tr(result)}</p>
  </Form></div></Section></>;
}
