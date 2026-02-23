'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { CURRENTS } from '../../data/currents'
import { PanelColorBar, PanelList, PanelRow } from './shared'

interface CurrentsPanelProps {
  selZones: Set<number>
  hlZones: Set<number>
  onHoverInfo: (info: HoverInfo | null) => void
  onSelectCurrent: (from: number, to: number) => void
}

export function CurrentsPanel({ selZones, hlZones, onHoverInfo, onSelectCurrent }: CurrentsPanelProps) {
  return (
    <PanelList>
      {CURRENTS.map(c => {
        const partner = 9 - c.from
        const isSelected = selZones.has(c.from) && selZones.has(c.to) && selZones.has(partner)
        const isHl = isSelected || hlZones.has(c.from) || hlZones.has(c.to) || hlZones.has(partner)
        return (
          <div key={c.name}>
            <PanelRow
              opacity={isSelected ? 1 : 0.5}
              onMouseEnter={() => onHoverInfo({ type: 'current', data: c })}
              onMouseLeave={() => onHoverInfo(null)}
              onClick={() => onSelectCurrent(c.from, c.to)}
            >
              <PanelColorBar color="#22ee66" active={isSelected || isHl} />
              <span style={{ color: '#22ee66', fontSize: '10px' }}>{c.name}</span>
              <div className="flex items-center gap-0.5 text-[8px]">
                <span style={{ color: ZONE_CLR[c.from] }}>{c.from}</span>
                <span className="text-gray-700">{'\u2192'}</span>
                <span style={{ color: ZONE_CLR[c.to] }}>{c.to}</span>
              </div>
              <span className="text-[8px] text-gray-700 ml-auto italic">{c.label}</span>
            </PanelRow>
          </div>
        )
      })}
    </PanelList>
  )
}
