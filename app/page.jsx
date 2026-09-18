import { Suspense } from 'react';
import { HomePage } from '../components/Flow/Pages';
import { pageMetadata } from '../lib/flow-content';
export const metadata = pageMetadata('');
export default function Page() { return <Suspense><HomePage /></Suspense>; }
