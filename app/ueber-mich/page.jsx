import { Suspense } from 'react';
import { AboutPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('ueber-mich');
export default function Page() { return <Suspense><AboutPage /></Suspense>; }
