import { Suspense } from 'react';
import { TermsPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('agb');
export default function Page() { return <Suspense><TermsPage /></Suspense>; }
