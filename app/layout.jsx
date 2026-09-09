import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/theme.css';
import Providers from './providers';

export const metadata = {
  title: { default: 'Yoga mit Anna', template: '%s | Yoga mit Anna' },
  description: 'Achtsame Bewegung und ehrliche Verbindung für mehr Ruhe, Stärke und Wohlbefinden.',
};

export default function RootLayout({ children }) {
  return <html lang="de"><body><Providers>{children}</Providers></body></html>;
}
