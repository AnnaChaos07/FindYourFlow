'use client';
import { useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { Field, ImageField, OrderButtons } from './Fields';
import { PageBody } from '../Pages/CustomPage';

export default function PagesEditor({ pages, onChange }) {
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(false);
  const page = pages.find(page => page.id === selected);
  const update = patch => onChange(pages.map(item => item.id === selected ? { ...item, ...patch } : item));
  const updateSection = (id, patch) => update({ sections: page.sections.map(item => item.id === id ? { ...item, ...patch } : item) });
  function add() {
    const id = crypto.randomUUID();
    onChange([...pages, { id, slug: 'neue-seite-' + id.slice(0,8), title: 'Neue Seite', eyebrow: '', intro: '', description: '', published: false, sections: [] }]);
    setSelected(id);
  }
  return <Row className="g-4"><Col lg={4}>
    <Button onClick={add} disabled={pages.length >= 50} className="mb-3">Seite hinzufügen</Button>
    {!pages.length && <p>Hier kannst du beispielsweise eine FAQ-, Impressum- oder Datenschutzseite anlegen.</p>}
    {pages.map(item => <Card key={item.id} className={'mb-2 ' + (selected === item.id ? 'border-primary' : '')}><Card.Body><Button variant="link" className="p-0 text-start" onClick={() => setSelected(item.id)}>{item.title}</Button><div><Badge bg={item.published ? 'success' : 'secondary'}>{item.published ? 'Veröffentlicht' : 'Entwurf'}</Badge></div></Card.Body></Card>)}
  </Col><Col lg={8}>{page && <>
    <div className="d-flex gap-2 mb-3"><Button variant="outline-primary" onClick={() => setPreview(true)}>Vorschau der Änderungen</Button><Button variant="outline-danger" onClick={() => { if (window.confirm('Diese Seite löschen? Nach dem Speichern ist sie nicht mehr erreichbar.')) { onChange(pages.filter(item => item.id !== page.id)); setSelected(null); } }}>Seite löschen</Button></div>
    <Field label="Seitentitel" value={page.title} onChange={title => update({ title })} required maxLength={200} />
    <Field label="URL-Kürzel" value={page.slug} onChange={slug => update({ slug })} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} hint="Eine Änderung des Kürzels ändert den Link. Bestehende Menüpunkte gegebenenfalls aktualisieren." />
    <p>Adresse: <code>/seite/?slug={page.slug}</code></p>
    <Form.Check id={"page-published-" + page.id} className="mb-3" label="Veröffentlicht (nach dem Speichern öffentlich erreichbar)" checked={page.published} onChange={event => update({ published: event.target.checked })} />
    <Field label="Text über der Überschrift" value={page.eyebrow} onChange={eyebrow => update({ eyebrow })} />
    <Field label="Einleitung" value={page.intro} onChange={intro => update({ intro })} multiline />
    <Field label="Seitenbeschreibung" value={page.description} onChange={description => update({ description })} maxLength={500} hint="Wird nach dem Laden als Beschreibung im Browser gesetzt." />
    <h3 className="h5">Inhaltsabschnitte</h3>
    {page.sections.map((section, index) => <Card className="mb-3" key={section.id}><Card.Body>
      <div className="d-flex flex-wrap gap-2 justify-content-between mb-3"><strong>Abschnitt {index + 1}</strong><div className="d-flex gap-2"><OrderButtons items={page.sections} index={index} onChange={sections => update({ sections })} label={'Abschnitt ' + (index + 1)} /><Button size="sm" variant="outline-danger" onClick={() => { if (window.confirm('Abschnitt entfernen?')) update({ sections: page.sections.filter(item => item.id !== section.id) }); }}>Entfernen</Button></div></div>
      <Field label="Überschrift" value={section.title} onChange={title => updateSection(section.id, { title })} />
      <Field label="Text" value={section.body} onChange={body => updateSection(section.id, { body })} multiline maxLength={20000} hint="Absätze und Zeilenumbrüche bleiben erhalten. HTML wird als Text angezeigt." />
      <ImageField label="Bild" value={section.image} onChange={image => updateSection(section.id, { image })} />
      <Field label="Bildbeschreibung" value={section.imageAlt} onChange={imageAlt => updateSection(section.id, { imageAlt })} />
      <Field label="Schaltfläche: Beschriftung (optional)" value={section.buttonLabel} onChange={buttonLabel => updateSection(section.id, { buttonLabel })} />
      <Field label="Schaltfläche: Ziel" value={section.buttonHref} onChange={buttonHref => updateSection(section.id, { buttonHref })} />
    </Card.Body></Card>)}
    <Button variant="outline-primary" disabled={page.sections.length >= 30} onClick={() => update({ sections: [...page.sections, { id: crypto.randomUUID(), title: '', body: '', image: '', imageAlt: '', buttonLabel: '', buttonHref: '' }] })}>Abschnitt hinzufügen</Button>
    <Modal size="lg" show={preview} onHide={() => setPreview(false)}><Modal.Header closeButton><Modal.Title>Vorschau – noch nicht gespeichert</Modal.Title></Modal.Header><Modal.Body><PageBody page={page} /></Modal.Body></Modal>
  </>}</Col></Row>;
}
