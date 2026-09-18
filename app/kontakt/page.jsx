import { Suspense } from 'react';
import Contact from '../../components/Pages/Contact';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('kontakt');
export default function Page() { return <Suspense><Contact/></Suspense>; }
