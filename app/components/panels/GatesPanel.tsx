'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { GATE_LIST } from '../../data/gates'
import { PanelColorBar, PanelCountToggleButton, PanelList, PanelRow } from './shared'

interface GatesPanelProps {
  hlZones: Set<number>
  selZones: Set<number>
  onHoverInfo: (info: HoverInfo | null) => void
  onSelectGate: (from: number, to: number) => void
  onToggleAll: () => void
}

export function GatesPanel({ hlZones, selZones, onHoverInfo, onSelectGate, onToggleAll }: GatesPanelProps) {
  return (
    <PanelList>
      <PanelCountToggleButton selectedCount={selZones.size} total={10} onClick={onToggleAll} />
      {GATE_LIST.map(g => {
        const isHl = hlZones.has(g.from) || hlZones.has(g.to)
        return (
          <div key={g.name}>
            <PanelRow
              opacity={isHl ? 1 : 0.5}
              onMouseEnter={() => onHoverInfo({ type: 'gate', gate: g })}
              onMouseLeave={() => onHoverInfo(null)}
              onClick={() => onSelectGate(g.from, g.to)}
            >
              <PanelColorBar color="#cc44ff" active={isHl} />
              <span style={{ color: '#cc44ff', fontSize: '10px' }}>{g.name}</span>
              <div className="flex items-center gap-0.5 text-[8px]">
                <span style={{ color: ZONE_CLR[g.from] }}>{g.from}</span>
                <span className="text-gray-700">{g.from === g.to ? '\u21BB' : '\u2192'}</span>
                <span style={{ color: ZONE_CLR[g.to] }}>{g.to}</span>
              </div>
              <span className="text-[7px] text-gray-700 ml-auto">{g.cum}</span>
            </PanelRow>
          </div>
        )
      })}
    </PanelList>
  )
}
