'use client'

import React from 'react'

type CyberStackGroupProps = {
  children: React.ReactNode
  className?: string
}

export function CyberStackGroup({ children, className = '' }: CyberStackGroupProps) {
  return <div className={`space-y-3 ${className}`}>{children}</div>
}

