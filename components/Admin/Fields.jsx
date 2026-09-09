'use client';
import { useId, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../axiosClient';

export function Field({ label, value, onChange, multiline = false, hint, ...props }) {
  const id = useId();
  return <Form.Group controlId={id} className="mb-3"><Form.Label>{label}</Form.Label>
    <Form.Control as={multiline ? 'textarea' : 'input'} rows={multiline ? 5 : undefined} value={value ?? ''} onChange={event => onChange(event.target.value)} {...props} />
    {hint && <Form.Text>{hint}</Form.Text>}
  </Form.Group>;
}
export function ImageField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const id = useId();
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Das Bild darf maximal 2 MB groß sein.'); return; }
    setUploading(true);
    const form = new FormData(); form.set('image', file); form.set('target', 'library');
    try { const { data } = await api.post('/api/admin/image', form); onChange(data.path); toast.success('Bild hochgeladen.'); }
    catch (error) { toast.error(error.response?.data?.message || 'Upload fehlgeschlagen.'); }
    finally { setUploading(false); }
  }
  return <div className="mb-4">
    <Field label={label} value={value} onChange={onChange} hint="Bildadresse eingeben, aus der Mediathek übernehmen oder ein Bild hochladen." />
    {value && <img src={value} alt="Bildvorschau" className="admin-image-preview rounded mb-2" />}
    <Form.Group controlId={id}><Form.Label>Bild hochladen (JPEG, PNG, WebP; maximal 2 MB)</Form.Label><Form.Control type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={upload} /></Form.Group>
    {uploading && <p role="status">Bild wird hochgeladen …</p>}
  </div>;
}
export function move(items, index, offset) {
  const next = [...items];
  [next[index], next[index + offset]] = [next[index + offset], next[index]];
  return next;
}
export function OrderButtons({ items, index, onChange, label }) {
  return <span className="d-inline-flex gap-1">
    <Button size="sm" variant="outline-secondary" aria-label={label + ' nach oben'} disabled={index === 0} onClick={() => onChange(move(items, index, -1))}>↑</Button>
    <Button size="sm" variant="outline-secondary" aria-label={label + ' nach unten'} disabled={index === items.length - 1} onClick={() => onChange(move(items, index, 1))}>↓</Button>
  </span>;
}
