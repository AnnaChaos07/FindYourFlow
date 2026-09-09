'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from './axiosClient';
import { defaults } from '../lib/content';

const SiteContext = createContext({ content: defaults, loading: true, error: false, refresh: async () => {} });
export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => {
    try { const { data } = await api.get('/api/content'); setContent({ ...defaults, ...data }); setError(false); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <SiteContext.Provider value={{ content, loading, error, refresh }}>{children}</SiteContext.Provider>;
}
export const useSiteState = () => useContext(SiteContext);
export default function useSiteContent() { return useSiteState().content; }
