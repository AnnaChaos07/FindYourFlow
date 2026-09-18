'use client';
import { usePathname } from 'next/navigation';
import { translate } from '../../lib/flow-translations';
export default function useText() {
  const locale = usePathname().startsWith('/en') ? 'en' : 'de';
  return value => translate(value, locale);
}
