'use client'

import React, { useState, type ReactNode } from 'react'
import { CyberPanelHeader } from './CyberPanelHeader'

type CyberCardContainerProps = {
  title: ReactNode
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
  const toggleOpen = () => setOpen(v => !v)

  return (
    <section className={`border border-[#334155] bg-[#0a1018] ${className}`}>
      <CyberPanelHeader
        title={title}
        className={`border-b border-[#334155] px-3 py-2 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? toggleOpen : undefined}
        onKeyDown={collapsible ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleOpen()
          }
        } : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        ariaExpanded={collapsible ? open : undefined}
        rightSlot={collapsible ? (
          <span className="text-xs text-gray-400" aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
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
