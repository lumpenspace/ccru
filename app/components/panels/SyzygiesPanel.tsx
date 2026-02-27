'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { SYZYGIES } from '../../data/syzygies'
import { SelectableListPanel, PanelColorBar, type SelectableListDisplayProps } from './shared'

interface SyzygiesPanelProps {
  selZones: Set<number>
  hlZones: Set<number>
  onToggleSyzygyPair: (a: number, b: number) => void
  onHoverInfo: (info: HoverInfo | null) => void
}

export function SyzygiesPanel({ selZones, hlZones, onToggleSyzygyPair, onHoverInfo }: SyzygiesPanelProps) {
  type SyzygyItem = { a: number; b: number; demon: string; desc: string; isHighlighted: boolean; isSelected: boolean }
  const items: SyzygyItem[] = SYZYGIES.map(s => ({
    ...s,
    isHighlighted: hlZones.has(s.a) || hlZones.has(s.b),
    isSelected: selZones.has(s.a) && selZones.has(s.b),
  }))

  const SyzygyItemDisplay = ({ item }: SelectableListDisplayProps<SyzygyItem>) => (
    <>
      <div className="flex gap-0.5 flex-shrink-0">
        <PanelColorBar color={ZONE_CLR[item.a]} active={item.isHighlighted} />
        <PanelColorBar color={ZONE_CLR[item.b]} active={item.isHighlighted} />
      </div>
      <span className="text-gray-400 text-[10px]">{item.a}::{item.b}</span>
      <span className="text-gray-600 text-[8px] italic">{item.demon}</span>
      <span className="text-[8px] text-gray-700 ml-auto">{item.b - item.a}</span>
    </>
  )

  return (
    <SelectableListPanel
      items={items}
      getKey={item => `${item.a}:${item.b}`}
      onItemSelect={item => onToggleSyzygyPair(item.a, item.b)}
      onItemMouseEnter={item => onHoverInfo({ type: 'syzygy', data: item })}
      onItemMouseLeave={() => onHoverInfo(null)}
      getItemOpacity={item => (item.isHighlighted || item.isSelected ? 1 : 0.5)}
      ItemDisplayComponent={SyzygyItemDisplay}
    />
  )
}
