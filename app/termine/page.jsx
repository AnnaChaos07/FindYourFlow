import { Suspense } from 'react';
import { DatesPage } from '../../components/Flow/Pages';
import { pageMetadata } from '../../lib/flow-content';
export const metadata = pageMetadata('termine');
export default function Page() { return <Suspense><DatesPage /></Suspense>; }
