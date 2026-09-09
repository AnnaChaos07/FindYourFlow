import { Suspense } from 'react';
import Offer from '../../components/Pages/Offer';
export const metadata = { title: 'Angebote' };
export default function Offers() {
  return <Suspense><Offer /></Suspense>;
}
