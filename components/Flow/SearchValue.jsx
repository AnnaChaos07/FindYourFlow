'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Keep query-aware behavior inside a small Suspense boundary so the surrounding
// editorial content remains present in Cloudflare's exported HTML.
export default function SearchValue({ name, onChange }) {
  const value = useSearchParams().get(name);
  useEffect(() => { onChange(value); }, [value, onChange]);
  return null;
}
