'use client'

import React from 'react'

interface ButtonProps {
  onClick: () => void
  active?: boolean
  indicator?: boolean
  children: React.ReactNode
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function Button({
  onClick,
  active = false,
  indicator = false,
  children,
  className = '',
  onMouseEnter,
  onMouseLeave,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`px-2.5 py-2 transition-all relative ${
        active ? 'bg-[#10ff50]/[0.08]' : 'hover:bg-white/[0.03]'
      } ${className}`}
      style={active ? { boxShadow: 'inset 0 -1px 0 rgba(16,255,80,0.4)' } : undefined}
    >
      {indicator && active && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-green-400/80" />
      )}
      {children}
    </button>
  )
}
