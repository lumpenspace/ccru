'use client'

import React, { useState } from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR, ZONE_REGION, ZONE_META } from '../../data/zones'
import { REGION_CLR } from '../../lib/constants'
import { formatXenotationForDisplay } from '../../lib/xenotation'
import { PanelColorBar, PanelCountToggleButton, PanelList, PanelRow, SidePopover } from './shared'

interface ZonesPanelProps {
  selZones: Set<number>
  hlZones: Set<number>
  onToggleZone: (z: number) => void
  onToggleAll: () => void
  onHoverInfo: (info: HoverInfo | null) => void
}

export function ZonesPanel({ selZones, hlZones, onToggleZone, onToggleAll, onHoverInfo }: ZonesPanelProps) {
  const [hoverCard, setHoverCard] = useState<{ text: string; color: string; x: number; y: number } | null>(null)

  const showNAOverlay = (e: React.MouseEvent<HTMLSpanElement>, color: string) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverCard({
      text: "one isn't real",
      color,
      x: rect.right + 10,
      y: rect.top + rect.height / 2,
    })
  }

  return (
    <PanelList>
      <PanelCountToggleButton selectedCount={selZones.size} total={10} onClick={onToggleAll} />
      {Array.from({ length: 10 }, (_, z) => {
        const clr = ZONE_CLR[z]
        const meta = ZONE_META[z]
        const xenotation = formatXenotationForDisplay(z)
        const isSelected = selZones.has(z)
        const isHl = hlZones.has(z)
        return (
          <div key={z}>
            <PanelRow
              opacity={isSelected || isHl ? 1 : 0.5}
              onClick={() => onToggleZone(z)}
              onMouseEnter={() => onHoverInfo({ type: 'zone', zone: z })}
              onMouseLeave={() => {
                onHoverInfo(null)
                setHoverCard(null)
              }}
            >
              <PanelColorBar color={clr} active={isSelected} />
              <span style={{ color: clr, fontSize: '10px' }}>{z}</span>
              <span className="text-gray-600 text-[9px]">{meta.planet}</span>
              <span
                className="text-[8px] tracking-[0.08em] text-gray-500"
                onMouseEnter={z === 1 && xenotation === 'n/a' ? e => showNAOverlay(e, clr) : undefined}
                onMouseLeave={z === 1 && xenotation === 'n/a' ? () => setHoverCard(null) : undefined}
              >
                {xenotation}
              </span>
              <span className="text-[8px] ml-auto" style={{ color: REGION_CLR[ZONE_REGION[z]], opacity: 0.5 }}>{ZONE_REGION[z]}</span>
            </PanelRow>
          </div>
        )
      })}
      <SidePopover card={hoverCard} />
    </PanelList>
  )
}
