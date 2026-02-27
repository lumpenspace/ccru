'use client'

import React from 'react'

interface NeonDividerProps {
  color?: string
}

export function NeonDivider({ color = '#10ff50' }: NeonDividerProps) {
  return (
    <div className="my-1.5 h-[1px] relative">
      <div className="absolute inset-0" style={{
        background: `linear-gradient(90deg, transparent 0%, ${color}44 20%, ${color}22 80%, transparent 100%)`,
      }} />
    </div>
  )
}
