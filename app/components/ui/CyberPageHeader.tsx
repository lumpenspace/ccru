'use client'

import Link from 'next/link'

type CyberPageHeaderProps = {
  title: string
  description?: string
  className?: string
}

export function CyberPageHeader({
  title,
  description,
  className = '',
}: CyberPageHeaderProps) {
  return (
    <header
      className={`px-2.5 py-1.5 ${className}`}
      style={{
        border: '1px solid rgba(16,255,80,0.16)',
        background:
          'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[9px] tracking-[0.28em] uppercase whitespace-nowrap"
            style={{ color: '#10ff50', textShadow: '0 0 6px rgba(16,255,80,0.3)' }}
          >
            {title}
          </span>
          {description && (
            <span className="text-[9px] tracking-[0.06em] text-gray-500 truncate hidden sm:inline">
              {description}
            </span>
          )}
        </div>
        <div className="ml-auto flex-shrink-0">
          <Link
            href="/"
            className="px-1.5 py-1 text-[9px] tracking-[0.12em] uppercase text-gray-500 hover:text-gray-200 transition-colors"
            style={{
              border: '1px solid rgba(107,114,128,0.35)',
              background: 'rgba(107,114,128,0.06)',
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  )
}
