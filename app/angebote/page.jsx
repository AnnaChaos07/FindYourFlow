import { Suspense } from 'react';
import { OffersPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('angebote');
export default function Page() { return <Suspense><OffersPage /></Suspense>; }
