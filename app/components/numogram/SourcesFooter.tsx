'use client'

import React from 'react'

const SOURCE_LINKS = [
  { label: '1', href: 'http://www.ccru.net/declab.htm' },
  { label: '2', href: 'https://socialecologies.wordpress.com/2025/08/17/the-numogram-diagram-time-circuits-and-acceleration/' },
  { label: '3', href: 'https://oh4.co/site/numogrammaticism.html' },
  { label: '4', href: 'https://drive.google.com/file/d/1ReZnkaZxsdNgEFghEZqDvpDoxhhTWHQ6/view?usp=drive_link' },
] as const

export function SourcesFooter() {
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[62] pointer-events-auto">
      <div
        className="px-3 py-1 text-[8px] md:text-[9px] tracking-[0.14em] uppercase font-mono text-center"
        style={{
          color: 'rgba(107,114,128,0.92)',
          background: 'linear-gradient(180deg, rgba(6,10,16,0.72) 0%, rgba(3,6,12,0.82) 100%)',
          border: '1px solid rgba(107,114,128,0.22)',
          boxShadow: '0 0 12px rgba(0,0,0,0.2)',
          whiteSpace: 'normal',
          maxWidth: 'calc(100vw - 16px)',
        }}
      >
        <span className="mr-2">sources</span>
        {SOURCE_LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-block mr-1 last:mr-2 hover:opacity-100 transition-opacity"
            style={{ color: '#9ca3af', opacity: 0.86 }}
            aria-label={`Source ${link.label}`}
          >
            [{link.label}]
          </a>
        ))}
        <span style={{ color: '#6b7280' }}>(c) qliphoth.systems / delight nexus</span>
      </div>
    </div>
  )
}
