'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR, ZONE_REGION, ZONE_META } from '../../data/zones'
import { REGION_CLR } from '../../lib/constants'

interface ZonesPanelProps {
  selZones: Set<number>
  hlZones: Set<number>
  onToggleZone: (z: number) => void
  onToggleAll: () => void
  onHoverInfo: (info: HoverInfo | null) => void
}

export function ZonesPanel({ selZones, hlZones, onToggleZone, onToggleAll, onHoverInfo }: ZonesPanelProps) {
  return (
    <div className="px-3 pb-2.5 space-y-0.5">
      <button
        onClick={onToggleAll}
        className="flex items-center gap-1.5 w-full py-1 mb-0.5 transition-all hover:opacity-100"
        style={{ opacity: selZones.size > 0 ? 0.7 : 0.4 }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          {selZones.size === 10 ? (
            <>
              <rect x="1" y="1" width="14" height="14" rx="1" stroke="#10ff50" strokeWidth="1" fill="none" />
              <path d="M4 8L7 11L12 5" stroke="#10ff50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <>
              <rect x="1" y="1" width="14" height="14" rx="1" stroke="#555" strokeWidth="1" fill="none" />
              {selZones.size > 0 && (
                <rect x="4" y="4" width="8" height="8" rx="0.5" fill="#555" opacity="0.5" />
              )}
            </>
          )}
        </svg>
        <span className="text-[8px] tracking-[0.15em] uppercase font-mono"
          style={{ color: selZones.size === 10 ? '#10ff50' : '#555' }}
        >{selZones.size === 10 ? 'all' : selZones.size > 0 ? `${selZones.size}/10` : 'none'}</span>
      </button>
      {Array.from({ length: 10 }, (_, z) => {
        const clr = ZONE_CLR[z]
        const meta = ZONE_META[z]
        const isSelected = selZones.has(z)
        const isHl = hlZones.has(z)
        return (
          <div key={z}>
            <div
              className="flex items-center gap-2 py-0.5 cursor-pointer"
              style={{ opacity: isSelected || isHl ? 1 : 0.5, transition: 'opacity 0.15s' }}
              onClick={() => onToggleZone(z)}
              onMouseEnter={() => onHoverInfo({ type: 'zone', zone: z })}
              onMouseLeave={() => onHoverInfo(null)}
            >
              <div className="w-1 h-3 flex-shrink-0 transition-all" style={{
                background: isSelected ? clr : `${clr}44`,
                boxShadow: isSelected ? `0 0 4px ${clr}66` : 'none',
              }} />
              <span style={{ color: clr, fontSize: '10px' }}>{z}</span>
              <span className="text-gray-600 text-[9px]">{meta.planet}</span>
              <span className="text-[8px] ml-auto" style={{ color: REGION_CLR[ZONE_REGION[z]], opacity: 0.5 }}>{ZONE_REGION[z]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
