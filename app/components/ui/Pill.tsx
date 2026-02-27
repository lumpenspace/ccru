'use client'

import React from 'react'

type PillProps = {
  children: React.ReactNode
  accent?: string
  onClose?: () => void
  closeLabel?: string
  className?: string
  title?: string
}

export function Pill({
  children,
  accent,
  onClose,
  closeLabel = 'Remove',
  className = '',
  title,
}: PillProps) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full border border-[#334155] bg-[#0b111a] px-1.5 py-[2px] text-[10px] leading-none text-gray-200 ${className}`}
      style={
        accent
          ? {
              color: accent,
              borderColor: `${accent}88`,
              background: `${accent}1a`,
            }
          : undefined
      }
      title={title}
    >
      <span>{children}</span>
      {onClose && (
        <button
          type="button"
          aria-label={closeLabel}
          className="rounded border border-transparent px-0.5 text-[9px] leading-none text-inherit opacity-80 transition hover:opacity-100"
          onClick={event => {
            event.preventDefault()
            event.stopPropagation()
            onClose()
          }}
        >
          x
        </button>
      )}
    </span>
  )
}
