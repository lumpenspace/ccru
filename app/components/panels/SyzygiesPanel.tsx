'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { SYZYGIES } from '../../data/syzygies'
import { PanelList, PanelRow } from './shared'

interface SyzygiesPanelProps {
  selZones: Set<number>
  hlZones: Set<number>
  onToggleSyzygyPair: (a: number, b: number) => void
  onHoverInfo: (info: HoverInfo | null) => void
}

export function SyzygiesPanel({ selZones, hlZones, onToggleSyzygyPair, onHoverInfo }: SyzygiesPanelProps) {
  return (
    <PanelList>
      {SYZYGIES.map(s => {
        const isHl = hlZones.has(s.a) || hlZones.has(s.b)
        return (
          <div key={`${s.a}:${s.b}`}>
            <PanelRow
              opacity={isHl ? 1 : 0.5}
              onMouseEnter={() => onHoverInfo({ type: 'syzygy', data: s })}
              onMouseLeave={() => onHoverInfo(null)}
              onClick={() => onToggleSyzygyPair(s.a, s.b)}
            >
              <div className="flex gap-0.5 flex-shrink-0">
                <div className="w-1 h-3 transition-all" style={{ background: isHl ? ZONE_CLR[s.a] : `${ZONE_CLR[s.a]}44` }} />
                <div className="w-1 h-3 transition-all" style={{ background: isHl ? ZONE_CLR[s.b] : `${ZONE_CLR[s.b]}44` }} />
              </div>
              <span className="text-gray-400 text-[10px]">{s.a}::{s.b}</span>
              <span className="text-gray-600 text-[8px] italic">{s.demon}</span>
              <span className="text-[8px] text-gray-700 ml-auto">{s.b - s.a}</span>
            </PanelRow>
          </div>
        )
      })}
    </PanelList>
  )
}
