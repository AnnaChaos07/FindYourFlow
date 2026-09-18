import { Suspense } from 'react';
import { DetailPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('praenatal');
export default function Page() { return <Suspense><DetailPage slug="praenatal"/></Suspense>; }
