'use client';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../axiosClient';
import { contentGroups, defaults } from '../../lib/content';
import { useSiteState } from '../useSiteContent';
import { Field, ImageField } from '../Admin/Fields';
import MenuEditor from '../Admin/MenuEditor';
import PagesEditor from '../Admin/PagesEditor';
import MediaEditor from '../Admin/MediaEditor';

const emptyCourse = { id: null, slug: '', title: '', teaser: '', duration: '', price: '', bookingUrl: '', description: '', published: true, sortOrder: 0 };

export default function Admin() {
  const { refresh } = useSiteState();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(defaults);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(emptyCourse);
  const [dirty, setDirty] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [group, setGroup] = useState(contentGroups[0].name);
  const mark = key => setDirty(previous => previous.includes(key) ? previous : [...previous, key]);
  const clean = key => setDirty(previous => previous.filter(item => item !== key));
  const changeContent = (key, value, area) => { setContent(previous => ({ ...previous, [key]: value })); mark(area); };

  useEffect(() => {
    api.get('/api/admin/status').then(({ data }) => setAuthenticated(data.authenticated)).catch(() => setError('Die Verwaltung ist nicht erreichbar. Bitte die Datenbankkonfiguration prüfen.')).finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    if (!authenticated) return;
    setReady(false);
    Promise.all([api.get('/api/admin/courses'), api.get('/api/admin/content')]).then(([a, b]) => { setCourses(a.data); setContent({ ...defaults, ...b.data }); setReady(true); }).catch(() => setError('Die Verwaltungsdaten konnten nicht geladen werden. Bitte die Seite neu laden.'));
  }, [authenticated]);
  useEffect(() => {
    if (!dirty.length) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  async function run(action) {
    setBusy(true); setError('');
    try { await action(); }
    catch (error) { setError(error.response?.data?.message || 'Die Änderung konnte nicht gespeichert werden.'); }
    finally { setBusy(false); }
  }
  async function saveContent(keys, area) {
    await run(async () => {
      const payload = Object.fromEntries(keys.map(key => [key, content[key]]));
      const { data } = await api.put('/api/admin/content', payload);
      setContent(previous => ({ ...previous, ...Object.fromEntries(keys.map(key => [key, data[key]])) }));
      clean(area); await refresh(); toast.success('Änderungen gespeichert.');
    });
  }
  async function saveCourse(event) {
    event.preventDefault();
    await run(async () => {
      if (course.id) await api.put('/api/admin/courses/' + course.id, course); else await api.post('/api/admin/courses', course);
      setCourses((await api.get('/api/admin/courses')).data); setCourse(emptyCourse); clean('course'); await refresh(); toast.success('Kurs gespeichert.');
    });
  }
  function editCourse(value) {
    if (dirty.includes('course') && !window.confirm('Ungespeicherte Kursänderungen verwerfen?')) return;
    setCourse(value); clean('course');
  }
  if (checking) return <Container className="py-5"><p role="status">Anmeldung wird geprüft …</p></Container>;
  if (!authenticated) return <Container className="py-5"><Row className="justify-content-center"><Col md={6} lg={4}>
    <Card><Card.Body><h1 className="h3">Adminbereich</h1>{error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={event => { event.preventDefault(); run(async () => { await api.post('/api/admin/login', { password }); setPassword(''); setAuthenticated(true); }); }}>
        <Field label="Passwort" type="password" autoComplete="current-password" value={password} onChange={setPassword} required />
        <Button type="submit" disabled={busy}>Anmelden</Button>
      </Form>
    </Card.Body></Card>
  </Col></Row></Container>;
  const selectedGroup = contentGroups.find(item => item.name === group);
  return <Container className="py-5 admin-panel">
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><p className="eyebrow">INHALTSVERWALTUNG</p><h1>Website verwalten</h1></div>
      <div className="d-flex flex-wrap gap-2">
        <Button href="/" target="_blank" rel="noopener noreferrer" variant="outline-primary">Website ansehen</Button>
        <Button disabled={!ready || busy} variant="outline-secondary" onClick={async () => { await run(async () => { const { data } = await api.get('/api/admin/content'); const { data: savedCourses } = await api.get('/api/admin/courses'); const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), content: data, courses: savedCourses }, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'website-inhalte.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }); }}>Gespeicherte Inhalte exportieren</Button>
        <Button disabled={busy} variant="outline-secondary" onClick={() => { if (dirty.length && !window.confirm('Ungespeicherte Änderungen verwerfen und abmelden?')) return; run(async () => { await api.post('/api/admin/logout'); setAuthenticated(false); setContent(defaults); setCourses([]); setDirty([]); }); }}>Abmelden</Button>
      </div>
    </div>
    {error && <Alert variant="danger" role="alert">{error}</Alert>}
    {dirty.length > 0 && <Alert variant="warning">Es gibt ungespeicherte Änderungen. Speichere sie im jeweiligen Bereich.</Alert>}
    {!ready ? <p role="status">Inhalte werden geladen …</p> : <fieldset disabled={busy}>
      <Tabs defaultActiveKey="texts" className="admin-tabs mb-4" mountOnEnter>
        <Tab eventKey="texts" title="Texte & Bilder">
          <Form.Select aria-label="Bereich auswählen" className="mb-4" value={group} onChange={event => setGroup(event.target.value)}>{contentGroups.map(item => <option key={item.name}>{item.name}</option>)}</Form.Select>
          <Form onSubmit={event => { event.preventDefault(); saveContent(selectedGroup.fields.map(([key]) => key), group); }}>
            <h2 className="h4">{group}</h2>
            {selectedGroup.fields.map(([key, label, , type]) => type === 'image' ? <ImageField key={key} label={label} value={content[key]} onChange={value => changeContent(key, value, group)} /> : <Field key={key} label={label} value={content[key]} multiline={type === 'textarea'} onChange={value => changeContent(key, value, group)} />)}
            <Button type="submit" disabled={!dirty.includes(group)}>Diesen Bereich speichern</Button>
          </Form>
        </Tab>
        <Tab eventKey="menus" title="Menüs">
          <p>Reihenfolge, Beschriftung, Sichtbarkeit und Unterpunkte sind frei wählbar. Die automatische Angebotsliste enthält nur veröffentlichte Kurse. Links zu unveröffentlichten Zusatzseiten werden öffentlich ausgeblendet.</p>
          <Row className="g-4">{[['navigation', 'Hauptmenü'], ['footerNavigation', 'Fußmenü']].map(([key, label]) => <Col lg={6} key={key}><Form onSubmit={event => { event.preventDefault(); saveContent([key], key); }}><h2 className="h4">{label}</h2><MenuEditor items={content[key]} pages={content.pages} onChange={value => changeContent(key, value, key)} /><Button type="submit" className="d-block mt-3" disabled={!dirty.includes(key)}>{label} speichern</Button></Form></Col>)}</Row>
        </Tab>
        <Tab eventKey="pages" title="Zusätzliche Seiten">
          <p>Seiten können als Entwurf vorbereitet und nach dem Speichern veröffentlicht werden. Verlinke sie anschließend im Haupt- oder Fußmenü.</p>
          <Form onSubmit={event => { event.preventDefault(); saveContent(['pages'], 'pages'); }}><PagesEditor pages={content.pages} onChange={value => changeContent('pages', value, 'pages')} /><Button type="submit" className="mt-4" disabled={!dirty.includes('pages')}>Seiten speichern</Button></Form>
        </Tab>
        <Tab eventKey="courses" title="Kurse">
          <Row className="g-4"><Col lg={5}><Form onSubmit={saveCourse}>
            <h2 className="h4">{course.id ? 'Kurs bearbeiten' : 'Kurs anlegen'}</h2>
            {[['title','Titel'],['slug','URL-Kürzel (optional)'],['teaser','Kurzbeschreibung'],['description','Ausführliche Beschreibung'],['duration','Dauer'],['price','Preis in Euro'],['bookingUrl','Eigener Purple-Slot-Link (optional)'],['sortOrder','Sortierung (kleine Zahlen zuerst)']].map(([key,label]) => <Field key={key} label={label} value={course[key]} onChange={value => { setCourse(previous => ({ ...previous, [key]: value })); mark('course'); }} multiline={['teaser','description'].includes(key)} type={['price','sortOrder'].includes(key) ? 'number' : 'text'} step={key === 'price' ? '0.01' : key === 'sortOrder' ? '1' : undefined} min={['price','sortOrder'].includes(key) ? '0' : undefined} required={['title','teaser','duration','price'].includes(key)} />)}
            <Form.Check id="course-published" className="mb-3" label="Veröffentlicht" checked={course.published} onChange={event => { setCourse(previous => ({ ...previous, published: event.target.checked })); mark('course'); }} />
            <Button type="submit">Kurs speichern</Button><Button variant="outline-secondary" className="ms-2" onClick={() => editCourse(emptyCourse)}>Zurücksetzen</Button>
          </Form></Col><Col lg={7}>{courses.map(item => <Card className="mb-3" key={item.id}><Card.Body><h3 className="h5">{item.title}</h3><Badge bg={item.published ? 'success' : 'secondary'}>{item.published ? 'Veröffentlicht' : 'Entwurf'}</Badge><p className="mt-2">{item.teaser}</p><p>{item.price} € · {item.duration} · Position {item.sortOrder}</p><div className="d-flex gap-2">
            <Button size="sm" onClick={() => editCourse(item)}>Bearbeiten</Button><Button size="sm" variant="outline-danger" onClick={() => { if (!window.confirm('Kurs endgültig löschen? Alternativ kannst du ihn als Entwurf ausblenden.')) return; if (course.id === item.id && dirty.includes('course') && !window.confirm('Auch die ungespeicherten Kursänderungen verwerfen?')) return; run(async () => { await api.delete('/api/admin/courses/' + item.id); setCourses(previous => previous.filter(entry => entry.id !== item.id)); if (course.id === item.id) { setCourse(emptyCourse); clean('course'); } await refresh(); }); }}>Löschen</Button>
          </div></Card.Body></Card>)}</Col></Row>
        </Tab>
        <Tab eventKey="media" title="Mediathek"><MediaEditor /></Tab>
      </Tabs>
    </fieldset>}
  </Container>;
}
