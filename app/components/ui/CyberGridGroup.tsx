'use client'

import React from 'react'

type CyberGridGroupProps = {
  children: React.ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

export function CyberGridGroup({
  children,
  className = '',
  columns = 2,
}: CyberGridGroupProps) {
  const colClass = columns === 4
    ? 'md:grid-cols-4'
    : columns === 3
      ? 'md:grid-cols-3'
      : 'md:grid-cols-2'

  return (
    <div className={`grid grid-cols-1 gap-3 ${colClass} ${className}`}>
      {children}
    </div>
  )
}

