'use client'

import React from 'react'

type CyberButtonProps = {
  onClick?: () => void
  active?: boolean
  indicator?: boolean
  disabled?: boolean
  size?: 'md' | 'sm'
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  className?: string
  children: React.ReactNode
}

export function CyberButton({
  onClick,
  active = false,
  indicator = false,
  disabled = false,
  size = 'md',
  onMouseEnter,
  onMouseLeave,
  className = '',
  children,
}: CyberButtonProps) {
  const sizeClass = size === 'sm'
    ? 'px-2 py-1 text-[10px] tracking-[0.1em]'
    : 'px-2.5 py-2 text-[11px] tracking-[0.12em]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative uppercase transition-all ${sizeClass} ${
        active ? 'bg-[#10ff50]/[0.08]' : 'bg-transparent hover:bg-white/[0.03]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={active ? { boxShadow: 'inset 0 -1px 0 rgba(16,255,80,0.4)' } : undefined}
    >
      {indicator && active && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-green-400/80" />
      )}
      {children}
    </button>
  )
}
