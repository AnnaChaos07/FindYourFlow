'use client';
import { AppContextProvider } from '../components/Components/AppContextProvider';
import { SiteContentProvider } from '../components/useSiteContent';
import Layout from '../components/Components/Layout';

export default function Providers({ children }) {
  return <AppContextProvider><SiteContentProvider><Layout>{children}</Layout></SiteContentProvider></AppContextProvider>;
}
