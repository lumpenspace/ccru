'use client'

import Link from 'next/link'

type CyberPageHeaderLink = {
  href: string
  label: string
}

type CyberPageHeaderProps = {
  title: string
  description?: string
  links?: CyberPageHeaderLink[]
  className?: string
}

export function CyberPageHeader({
  title,
  description,
  links = [],
  className = '',
}: CyberPageHeaderProps) {
  return (
    <header className={`flex items-center justify-between gap-3 ${className}`}>
      <div>
        <h1 className="text-xl uppercase tracking-[0.2em] text-gray-100">{title}</h1>
        {description && (
          <p className="text-xs tracking-[0.08em] text-gray-400">{description}</p>
        )}
      </div>
      {links.length > 0 && (
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]">
          {links.map(link => (
            <Link
              key={`${link.href}:${link.label}`}
              href={link.href}
              className="border border-gray-700 px-2 py-1 text-gray-300 hover:border-gray-500 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
