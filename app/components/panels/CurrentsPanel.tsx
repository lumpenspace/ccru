'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { CURRENTS } from '../../data/currents'
import { PanelColorBar, SelectableListPanel, type SelectableListDisplayProps } from './shared'

interface CurrentsPanelProps {
  selZones: Set<number>
  hlZones: Set<number>
  onHoverInfo: (info: HoverInfo | null) => void
  onSelectCurrent: (from: number, to: number) => void
}

export function CurrentsPanel({ selZones, hlZones, onHoverInfo, onSelectCurrent }: CurrentsPanelProps) {
  type CurrentItem = {
    name: string
    from: number
    to: number
    label: string
    desc: string
    isSelected: boolean
    isHighlighted: boolean
  }
  const items: CurrentItem[] = CURRENTS.map(c => {
    const partner = 9 - c.from
    const isSelected = selZones.has(c.from) && selZones.has(c.to) && selZones.has(partner)
    return {
      ...c,
      isSelected,
      isHighlighted: isSelected || hlZones.has(c.from) || hlZones.has(c.to) || hlZones.has(partner),
    }
  })

  const CurrentItemDisplay = ({ item }: SelectableListDisplayProps<CurrentItem>) => (
    <>
      <PanelColorBar color="#22ee66" active={item.isSelected || item.isHighlighted} />
      <span style={{ color: '#22ee66', fontSize: '10px' }}>{item.name}</span>
      <div className="flex items-center gap-0.5 text-[8px]">
        <span style={{ color: ZONE_CLR[item.from] }}>{item.from}</span>
        <span className="text-gray-700">{'\u2192'}</span>
        <span style={{ color: ZONE_CLR[item.to] }}>{item.to}</span>
      </div>
      <span className="text-[8px] text-gray-700 ml-auto italic">{item.label}</span>
    </>
  )

  return (
    <SelectableListPanel
      items={items}
      getKey={item => item.name}
      onItemSelect={item => onSelectCurrent(item.from, item.to)}
      onItemMouseEnter={item => onHoverInfo({ type: 'current', data: item })}
      onItemMouseLeave={() => onHoverInfo(null)}
      getItemOpacity={item => (item.isSelected ? 1 : 0.5)}
      ItemDisplayComponent={CurrentItemDisplay}
    />
  )
}
