'use client';
import { Button, Card, Form } from 'react-bootstrap';
import { Field, OrderButtons } from './Fields';

export default function MenuEditor({ items, onChange, pages, depth = 0 }) {
  const update = (id, patch) => onChange(items.map(item => item.id === id ? { ...item, ...patch } : item));
  return <div>
    {items.map((item, index) => <Card className="mb-3" key={item.id}><Card.Body>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3"><strong>{item.label || 'Neuer Menüpunkt'}</strong><div className="d-flex gap-2">
        <OrderButtons items={items} index={index} onChange={onChange} label={item.label} />
        <Button size="sm" variant="outline-danger" onClick={() => { if (window.confirm('Menüpunkt mit allen Unterpunkten entfernen?')) onChange(items.filter(entry => entry.id !== item.id)); }}>Entfernen</Button>
      </div></div>
      <Field label="Beschriftung" value={item.label} onChange={label => update(item.id, { label })} maxLength={100} required />
      <Form.Label>Art des Menüpunkts</Form.Label>
      <Form.Select aria-label="Art des Menüpunkts" className="mb-3" value={item.type} onChange={event => update(item.id, { type: event.target.value })}>
        <option value="link">Link zu einer Seite</option><option value="booking">Purple-Slot-Buchung</option>
        {!depth && <><option value="courses">Angebote automatisch auflisten</option><option value="group">Eigene Unterpunkte</option></>}
      </Form.Select>
      {item.type === 'link' && <>
        <Field label="Linkziel" value={item.href} onChange={href => update(item.id, { href })} required hint="Interner Pfad (/kontakt/), HTTPS-Adresse, mailto: oder tel:." />
        <Form.Select aria-label="Vorhandene Seite als Linkziel auswählen" className="mb-3" value="" onChange={event => { if (event.target.value) update(item.id, { href: event.target.value }); }}>
          <option value="">Vorhandene Seite auswählen …</option><option value="/">Startseite</option><option value="/ueber-mich/">Über mich</option><option value="/kontakt/">Kontakt</option>
          {pages.map(page => <option key={page.id} value={'/seite/?slug=' + page.slug}>{page.title}{page.published ? '' : ' (Entwurf)'}</option>)}
        </Form.Select>
      </>}
      <Form.Check id={"menu-visible-" + item.id} label="Sichtbar" checked={item.visible} onChange={event => update(item.id, { visible: event.target.checked })} />
      {['link', 'booking'].includes(item.type) && <Form.Check id={"menu-newtab-" + item.id} label="In neuem Tab öffnen" checked={item.newTab} onChange={event => update(item.id, { newTab: event.target.checked })} />}
      {item.type === 'group' && <div className="mt-3 ps-3 border-start"><MenuEditor items={item.children} pages={pages} depth={depth + 1} onChange={children => update(item.id, { children })} /></div>}
    </Card.Body></Card>)}
    <Button variant="outline-primary" disabled={items.length >= 30} onClick={() => onChange([...items, { id: crypto.randomUUID(), label: 'Neuer Menüpunkt', type: 'link', href: '/', visible: true, newTab: false, children: [] }])}>Menüpunkt hinzufügen</Button>
  </div>;
}
