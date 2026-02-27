'use client'

import type { ReactNode } from 'react'
import { HomeLink } from './HomeLink'

type CyberPageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  icon?: string
  className?: string
  homeHref?: string
  homeLabel?: string
  showHomeLink?: boolean
  actions?: ReactNode
}

export function CyberPageHeader({
  title,
  description,
  icon,
  className = '',
  homeHref = '/',
  homeLabel = 'Home',
  showHomeLink = true,
  actions,
}: CyberPageHeaderProps) {
  return (
    <header className={`flex items-stretch gap-2 ${className}`}>
      {showHomeLink && (
        <div
          className="flex shrink-0 items-center px-1.5"
          style={{
            border: '1px solid rgba(16,255,80,0.16)',
            background:
              'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
          }}
        >
          <HomeLink href={homeHref} label={homeLabel} boxed={false} />
        </div>
      )}
      <div
        className="min-w-0 flex-1 px-2.5 py-1.5"
        style={{
          border: '1px solid rgba(16,255,80,0.16)',
          background:
            'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 3px rgba(16,255,80,0.4))' }} />
          )}
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
      </div>
      {actions && (
        <div
          className="flex shrink-0 items-center px-1.5"
          style={{
            border: '1px solid rgba(16,255,80,0.16)',
            background:
              'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
          }}
        >
          {actions}
        </div>
      )}
    </header>
  )
}
