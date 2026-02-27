'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { GATE_LIST } from '../../data/gates'
import {
  PanelColorBar,
  PanelCountToggleButton,
  SelectableListPanel,
  type SelectableListDisplayProps,
} from './shared'

interface GatesPanelProps {
  hlZones: Set<number>
  selZones: Set<number>
  onHoverInfo: (info: HoverInfo | null) => void
  onSelectGate: (from: number, to: number) => void
  onToggleAll: () => void
}

export function GatesPanel({ hlZones, selZones, onHoverInfo, onSelectGate, onToggleAll }: GatesPanelProps) {
  type GateItem = {
    name: string
    from: number
    to: number
    cum: number
    desc: string
    detail: string
    isSelected: boolean
    isSemiSelected: boolean
    isHighlighted: boolean
  }
  const items: GateItem[] = GATE_LIST.map(g => ({
    ...g,
    ...(() => {
      const terminalCount = g.from === g.to ? 1 : 2
      const selectedCount = g.from === g.to
        ? (selZones.has(g.from) ? 1 : 0)
        : (selZones.has(g.from) ? 1 : 0) + (selZones.has(g.to) ? 1 : 0)
      const isSelected = selectedCount === terminalCount
      const isSemiSelected = selectedCount > 0 && !isSelected
      return {
        isSelected,
        isSemiSelected,
        isHighlighted: isSelected || isSemiSelected || hlZones.has(g.from) || hlZones.has(g.to),
      }
    })(),
  }))

  const GateItemDisplay = ({ item }: SelectableListDisplayProps<GateItem>) => (
    <>
      <PanelColorBar color="#cc44ff" active={item.isSelected || item.isSemiSelected || item.isHighlighted} />
      <span style={{ color: '#cc44ff', fontSize: '10px' }}>{item.name}</span>
      <div className="flex items-center gap-0.5 text-[8px]">
        <span style={{ color: ZONE_CLR[item.from] }}>{item.from}</span>
        <span className="text-gray-700">{item.from === item.to ? '\u21BB' : '\u2192'}</span>
        <span style={{ color: ZONE_CLR[item.to] }}>{item.to}</span>
      </div>
      <span className="text-[7px] text-gray-700 ml-auto">{item.cum}</span>
    </>
  )

  return (
    <SelectableListPanel
      items={items}
      getKey={item => item.name}
      header={<PanelCountToggleButton selectedCount={selZones.size} total={10} onClick={onToggleAll} />}
      onItemSelect={item => onSelectGate(item.from, item.to)}
      onItemMouseEnter={item => onHoverInfo({ type: 'gate', gate: item })}
      onItemMouseLeave={() => onHoverInfo(null)}
      getItemOpacity={item => (item.isSelected ? 1 : item.isSemiSelected ? 0.8 : item.isHighlighted ? 0.65 : 0.5)}
      ItemDisplayComponent={GateItemDisplay}
    />
  )
}
