import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/theme.css';
import Providers from './providers';

export const metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
  title: { default: 'Find Your Flow', template: '%s | Find Your Flow' },
  description: 'Räume für Frauengesundheit, Körperwissen und Verbindung – mit Anna in Berlin und online.',
};

export default function RootLayout({ children }) {
  return <html lang="de"><body><Providers>{children}</Providers></body></html>;
}
