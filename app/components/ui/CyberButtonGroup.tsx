'use client'

import React from 'react'

type CyberButtonGroupProps = {
  children: React.ReactNode
  cornerSize?: number
  className?: string
}

export function CyberButtonGroup({
  children,
  cornerSize = 8,
  className = '',
}: CyberButtonGroupProps) {
  return (
    <div
      className={`inline-flex border border-[#10ff50]/20 ${className}`}
      style={{
        clipPath: `polygon(${cornerSize}px 0, 100% 0, 100% calc(100% - ${cornerSize}px), calc(100% - ${cornerSize}px) 100%, 0 100%, 0 ${cornerSize}px)`,
      }}
    >
      {children}
    </div>
  )
}

