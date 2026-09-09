'use client';
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../axiosClient';
import { ImageField } from './Fields';

export default function MediaEditor() {
  const [images, setImages] = useState([]);
  const [path, setPath] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/api/admin/images').then(({ data }) => { setImages(data); setError(''); }).catch(() => setError('Die Mediathek konnte nicht geladen werden.'));
  }, [path]);
  return <>
    <p>Hochgeladene Bilder können auf mehreren Seiten verwendet werden. Kopiere eine Bildadresse in das gewünschte Bildfeld. Angezeigt werden die 100 neuesten Uploads; ältere Bildadressen bleiben gültig.</p>
    <ImageField label="Neues Bild" value={path} onChange={setPath} />
    {error && <Alert variant="warning">{error}</Alert>}
    <Row className="g-3">{images.map(image => <Col md={6} lg={4} key={image.id}><Card><Card.Body>
      <img src={image.path} alt="Hochgeladenes Bild" className="admin-image-preview rounded mb-3" />
      <p className="small text-break">{image.path}</p><Button size="sm" onClick={async () => { try { await navigator.clipboard.writeText(image.path); toast.success('Bildadresse kopiert.'); } catch { toast.info('Bitte die angezeigte Bildadresse markieren und kopieren.'); } }}>Bildadresse kopieren</Button>
    </Card.Body></Card></Col>)}</Row>
  </>;
}
