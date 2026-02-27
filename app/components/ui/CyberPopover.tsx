'use client'

import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type CyberPopoverProps = {
  trigger: React.ReactNode
  content: React.ReactNode
}

export function CyberPopover({ trigger, content }: CyberPopoverProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const canRenderPortal = typeof document !== 'undefined'

  const popover = useMemo(() => {
    if (!open || !canRenderPortal) return null
    return createPortal(
      <div
        className="fixed z-[120] max-w-[320px] px-2 py-1.5 text-[11px] leading-relaxed"
        style={{
          left: pos.x,
          top: pos.y,
          transform: 'translateY(-50%)',
          border: '1px solid rgba(16,255,80,0.35)',
          background: 'linear-gradient(180deg, rgba(8,12,20,0.96) 0%, rgba(4,7,13,0.96) 100%)',
          color: '#9ca3af',
          boxShadow: '0 0 14px rgba(16,255,80,0.15)',
        }}
      >
        {content}
      </div>,
      document.body
    )
  }, [canRenderPortal, content, open, pos.x, pos.y])

  return (
    <>
      <span
        className="inline-flex"
        onMouseEnter={e => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          setPos({ x: rect.right + 10, y: rect.top + rect.height / 2 })
          setOpen(true)
        }}
        onMouseLeave={() => setOpen(false)}
      >
        {trigger}
      </span>
      {popover}
    </>
  )
}

