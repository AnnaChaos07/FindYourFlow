import LegalPage from '../../../components/Pages/LegalPage';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AboutPage, OffersPage, PreventionPage, DatesPage, ClassesPage, TermsPage, DetailPage } from '../../../components/Flow/Pages';
import Contact from '../../../components/Pages/Contact';
import { pages, routeTitles, pageMetadata } from '../../../lib/flow-content';
export const dynamicParams=false;
export function generateStaticParams(){return Object.keys(routeTitles).filter(Boolean).map(slug=>({slug}));}
export async function generateMetadata({params}){const {slug}=await params;return pageMetadata(slug,'en');}
const components={'ueber-mich':AboutPage,angebote:OffersPage,praeventionskurse:PreventionPage,termine:DatesPage,'offene-stunden':ClassesPage,agb:TermsPage,kontakt:Contact};
export default async function Page({params}){const {slug}=await params;const Component=components[slug];if(['impressum','datenschutz'].includes(slug))return <LegalPage slug={slug}/>;if(!Component&&!pages[slug])notFound();return <Suspense>{Component?<Component/>:<DetailPage slug={slug}/>}</Suspense>;}
