'use client'

import React from 'react'

interface StatusDotProps {
  color: string
  pulse?: boolean
  className?: string
}

export function StatusDot({ color, pulse = true, className = '' }: StatusDotProps) {
  return (
    <span
      className={`inline-block w-[5px] h-[5px] rounded-full flex-shrink-0 ${className}`}
      style={{
        background: color,
        boxShadow: `0 0 4px ${color}88`,
        animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : undefined,
      }}
    />
  )
}
