'use client'

import React from 'react'
import type { Region } from '../../data/types'
import { REGION_CLR } from '../../lib/constants'
import { HoverInfoList, type HoverInfoListItem } from './HoverInfoList'

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
  const items: HoverInfoListItem[] = [
    ...REGION_DEFS.map(r => {
      const active = hlRegion === r.id
      return {
        id: r.id,
        color: REGION_CLR[r.id],
        active,
        info: r.info,
        onClick: () => onSelectRegion(active ? null : r.id),
        opacity: 1,
        label: (
          <span style={{
            color: REGION_CLR[r.id],
            opacity: active ? 1 : 0.6,
            textShadow: active ? `0 0 6px ${REGION_CLR[r.id]}44` : 'none',
          }}
          >{r.label}</span>
        ),
        right: <span className="text-gray-700 text-[9px] font-mono">{r.zones}</span>,
      }
    }),
    {
      id: 'time-circuit',
      color: '#00ccff',
      active: tcActive,
      info: '1\u21928\u21927\u21922\u21925\u21924\u21921 \u2014 the anticlockwise hydrocycle driven by Surge, Hold, and Sink currents.',
      onClick: onToggleTC,
      opacity: 1,
      className: 'mt-1 pt-1',
      style: { borderTop: '1px solid rgba(16,255,80,0.06)' },
      label: (
        <span style={{
          color: '#00ccff',
          opacity: tcActive ? 1 : 0.6,
          textShadow: tcActive ? '0 0 6px #00ccff44' : 'none',
        }}
        >Time Circuit</span>
      ),
    },
  ]

  return <HoverInfoList items={items} className="space-y-1" />
}
