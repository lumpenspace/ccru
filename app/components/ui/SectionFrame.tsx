'use client'

import React from 'react'

interface SectionFrameProps {
  title?: string
  color?: string
  children: React.ReactNode
}

export function SectionFrame({ title, color = '#10ff50', children }: SectionFrameProps) {
  return (
    <div className="relative pl-2 py-1">
      {/* Corner marks */}
      <div className="absolute top-0 left-0 w-2 h-[1px]" style={{ background: `${color}55` }} />
      <div className="absolute top-0 left-0 w-[1px] h-2" style={{ background: `${color}55` }} />
      <div className="absolute bottom-0 right-0 w-2 h-[1px]" style={{ background: `${color}22` }} />
      <div className="absolute bottom-0 right-0 w-[1px] h-2" style={{ background: `${color}22` }} />
      {title && (
        <div className="text-[7px] tracking-[0.2em] uppercase mb-1" style={{ color: `${color}88` }}>{title}</div>
      )}
      {children}
    </div>
  )
}
