'use client'

import React from 'react'

interface DataRowProps {
  label: string
  value: string
  color?: string
}

export function DataRow({ label, value, color = '#10ff50' }: DataRowProps) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-mono">
      <div className="w-[2px] h-2.5 flex-shrink-0" style={{ background: `${color}66` }} />
      <span className="tracking-[0.12em] uppercase text-gray-600 flex-shrink-0" style={{ fontSize: 8 }}>{label}</span>
      <span className="flex-1 text-gray-700 overflow-hidden" style={{ fontSize: 7, letterSpacing: '0.15em' }}>
        {'·'.repeat(30)}
      </span>
      <span style={{ color: `${color}cc` }}>{value}</span>
    </div>
  )
}
