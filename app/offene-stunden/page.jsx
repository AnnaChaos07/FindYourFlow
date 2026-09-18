import { Suspense } from 'react';
import { ClassesPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('offene-stunden');
export default function Page() { return <Suspense><ClassesPage /></Suspense>; }
