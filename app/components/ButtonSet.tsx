'use client'

import React from 'react'

interface ButtonSetProps {
  children: React.ReactNode
  cornerSize?: number
  className?: string
}

export function ButtonSet({ children, cornerSize = 8, className = '' }: ButtonSetProps) {
  return (
    <div
      className={`inline-flex ${className}`}
      style={{
        border: '1px solid rgba(16,255,80,0.12)',
        clipPath: `polygon(${cornerSize}px 0, 100% 0, 100% calc(100% - ${cornerSize}px), calc(100% - ${cornerSize}px) 100%, 0 100%, 0 ${cornerSize}px)`,
      }}
    >
      {children}
    </div>
  )
}
