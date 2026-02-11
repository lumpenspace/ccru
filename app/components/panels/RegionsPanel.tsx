'use client'

import React from 'react'
import type { Region } from '../../data/types'
import { REGION_CLR } from '../../lib/constants'

interface RegionsPanelProps {
  hlRegion: Region | null
  tcActive: boolean
  onSelectRegion: (r: Region | null) => void
  onToggleTC: () => void
}

const REGION_DEFS: { id: Region; label: string; zones: string; info: string }[] = [
  { id: 'torque', label: 'Torque', zones: '1 2 4 5 7 8',
    info: 'The six-zone Time Circuit \u2014 inner time. Cyclical recursion through Surge, Hold, and Sink currents drives the anticlockwise hydrocycle: precipitation, evaporation, and cataclysmic return.' },
  { id: 'warp', label: 'Warp', zones: '3 6',
    info: 'Zones 3 and 6 \u2014 Outer-Time. A self-referential vortical loop, intrinsically cryptic. The 3+6 syzygy difference folds back into itself, constituting autonomous temporality.' },
  { id: 'plex', label: 'Plex', zones: '0 9',
    info: 'Zones 0 and 9 \u2014 the absolute outer. The Plex envelops the entire system. The 0+9 syzygy constitutes the outermost curve of the Barker spiral, where existence and nonexistence converge.' },
]

export function RegionsPanel({ hlRegion, tcActive, onSelectRegion, onToggleTC }: RegionsPanelProps) {
  return (
    <div className="px-3 pb-2.5 space-y-1">
      {REGION_DEFS.map(r => (
        <div key={r.id}>
          <div
            className="flex items-center gap-2 cursor-pointer py-0.5"
            onClick={() => onSelectRegion(hlRegion === r.id ? null : r.id)}
          >
            <div className="w-1 h-3 flex-shrink-0 transition-all" style={{
              background: hlRegion === r.id ? REGION_CLR[r.id] : `${REGION_CLR[r.id]}44`,
              boxShadow: hlRegion === r.id ? `0 0 6px ${REGION_CLR[r.id]}66` : 'none',
            }} />
            <span style={{
              color: REGION_CLR[r.id],
              opacity: hlRegion === r.id ? 1 : 0.6,
              textShadow: hlRegion === r.id ? `0 0 6px ${REGION_CLR[r.id]}44` : 'none',
            }}>{r.label}</span>
            <span className="text-gray-700 text-[9px] ml-auto font-mono">{r.zones}</span>
          </div>
          {hlRegion === r.id && (
            <p className="text-[8px] leading-relaxed pl-3 pb-1 italic" style={{ color: `${REGION_CLR[r.id]}88` }}>{r.info}</p>
          )}
        </div>
      ))}
      <div className="mt-1 pt-1" style={{ borderTop: '1px solid rgba(16,255,80,0.06)' }}>
        <div
          className="flex items-center gap-2 cursor-pointer py-0.5"
          onClick={onToggleTC}
        >
          <div className="w-1 h-3 flex-shrink-0 transition-all" style={{
            background: tcActive ? '#00ccff' : '#00ccff44',
            boxShadow: tcActive ? '0 0 6px #00ccff66' : 'none',
          }} />
          <span style={{
            color: '#00ccff',
            opacity: tcActive ? 1 : 0.6,
            textShadow: tcActive ? '0 0 6px #00ccff44' : 'none',
          }}>Time Circuit</span>
        </div>
        {tcActive && (
          <p className="text-[8px] leading-relaxed pl-3 pb-1 italic" style={{ color: '#00ccff88' }}>
            1{'\u2192'}8{'\u2192'}7{'\u2192'}2{'\u2192'}5{'\u2192'}4{'\u2192'}1 — the anticlockwise hydrocycle driven by Surge, Hold, and Sink currents.
          </p>
        )}
      </div>
    </div>
  )
}
