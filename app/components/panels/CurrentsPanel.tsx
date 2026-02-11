'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { CURRENTS } from '../../data/currents'

interface CurrentsPanelProps {
  hlZones: Set<number>
  onHoverInfo: (info: HoverInfo | null) => void
  onSelectCurrent: (from: number, to: number) => void
}

export function CurrentsPanel({ hlZones, onHoverInfo, onSelectCurrent }: CurrentsPanelProps) {
  return (
    <div className="px-3 pb-2.5 space-y-0.5">
      {CURRENTS.map(c => {
        const partner = 9 - c.from
        const isHl = hlZones.has(c.from) || hlZones.has(c.to) || hlZones.has(partner)
        return (
          <div key={c.name}>
            <div
              className="flex items-center gap-2 py-0.5 cursor-pointer"
              style={{ opacity: isHl ? 1 : 0.5, transition: 'opacity 0.15s' }}
              onMouseEnter={() => onHoverInfo({ type: 'current', data: c })}
              onMouseLeave={() => onHoverInfo(null)}
              onClick={() => onSelectCurrent(c.from, c.to)}
            >
              <div className="w-1 h-3 flex-shrink-0 transition-all" style={{
                background: isHl ? '#22ee66' : '#22ee6644',
                boxShadow: isHl ? '0 0 4px #22ee6666' : 'none',
              }} />
              <span style={{ color: '#22ee66', fontSize: '10px' }}>{c.name}</span>
              <div className="flex items-center gap-0.5 text-[8px]">
                <span style={{ color: ZONE_CLR[c.from] }}>{c.from}</span>
                <span className="text-gray-700">{'\u2192'}</span>
                <span style={{ color: ZONE_CLR[c.to] }}>{c.to}</span>
              </div>
              <span className="text-[8px] text-gray-700 ml-auto italic">{c.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
