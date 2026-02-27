'use client'

import React, { useState } from 'react'
import { CyberPanelHeader } from './CyberPanelHeader'

type CyberCardContainerProps = {
  title: string
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

export function CyberCardContainer({
  title,
  children,
  className = '',
  collapsible = false,
  defaultOpen = true,
}: CyberCardContainerProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={`border border-[#334155] bg-[#0a1018] ${className}`}>
      <CyberPanelHeader
        title={title}
        className="border-b border-[#334155] px-3 py-2"
        rightSlot={collapsible ? (
          <button
            type="button"
            className="text-xs text-gray-400"
            onClick={() => setOpen(v => !v)}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : undefined}
      />
      {(!collapsible || open) && (
        <div className="px-3 py-3">
          {children}
        </div>
      )}
    </section>
  )
}
