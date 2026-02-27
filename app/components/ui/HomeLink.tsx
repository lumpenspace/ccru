'use client'

import Link from 'next/link'

type HomeLinkProps = {
  href?: string
  label?: string
  className?: string
  boxed?: boolean
}

export function HomeLink({
  href = '/',
  label = 'Home',
  className = '',
  boxed = true,
}: HomeLinkProps) {
  const chromeStyle = boxed
    ? {
        border: '1px solid rgba(107,114,128,0.35)',
        background: 'rgba(107,114,128,0.06)',
      }
    : undefined

  return (
    <Link
      href={href}
      className={`px-1.5 py-1 text-[9px] tracking-[0.12em] uppercase text-gray-500 hover:text-gray-200 transition-colors ${className}`}
      style={chromeStyle}
    >
      {label}
    </Link>
  )
}
