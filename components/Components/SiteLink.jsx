'use client';
import Link from 'next/link';
export default function SiteLink({ href, newTab, children, ...props }) {
  if (!href) return null;
  const target = newTab ? '_blank' : undefined;
  const rel = newTab ? 'noopener noreferrer' : undefined;
  return href.startsWith('/') ? <Link href={href} target={target} rel={rel} {...props}>{children}</Link> : <a href={href} target={target} rel={rel} {...props}>{children}</a>;
}
