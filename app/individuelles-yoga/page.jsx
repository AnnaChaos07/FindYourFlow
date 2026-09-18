import { Suspense } from 'react';
import { DetailPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('individuelles-yoga');
export default function Page() { return <Suspense><DetailPage slug="individuelles-yoga"/></Suspense>; }
