import { Suspense } from 'react';
import { DetailPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('red-circle');
export default function Page() { return <Suspense><DetailPage slug="red-circle"/></Suspense>; }
