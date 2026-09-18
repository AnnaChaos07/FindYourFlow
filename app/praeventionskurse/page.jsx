import { Suspense } from 'react';
import { PreventionPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('praeventionskurse');
export default function Page() { return <Suspense><PreventionPage /></Suspense>; }
