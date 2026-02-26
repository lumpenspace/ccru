'use client'

import React, { useState } from 'react'
import { PanelColorBar, SelectableListPanel, SidePopover } from './shared'

export interface HoverInfoListItem {
  id: string
  color: string
  active: boolean
  info: string
  label: React.ReactNode
  right?: React.ReactNode
  onClick: () => void
  opacity?: number
  inactiveColor?: string
  className?: string
  style?: React.CSSProperties
}

interface HoverInfoListProps {
  items: HoverInfoListItem[]
  className?: string
}

export function HoverInfoList({ items, className = '' }: HoverInfoListProps) {
  const [hoverCard, setHoverCard] = useState<{ text: string; color: string; x: number; y: number } | null>(null)

  const showHoverCard = (e: React.MouseEvent<HTMLDivElement>, text: string, color: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoverCard({
      text,
      color,
      x: rect.right + 10,
      y: rect.top + rect.height / 2,
    })
  }

  return (
    <SelectableListPanel
      items={items}
      className={`relative ${className}`}
      getKey={item => item.id}
      onItemSelect={item => item.onClick()}
      onItemMouseEnter={(item, _index, event) => showHoverCard(event, item.info, item.color)}
      onItemMouseLeave={() => setHoverCard(null)}
      getItemClassName={item => item.className}
      getItemStyle={item => item.style}
      getItemOpacity={item => item.opacity ?? (item.active ? 1 : 0.3)}
      itemDisplay={({ item }) => (
        <>
          <PanelColorBar
            color={item.color}
            active={item.active}
            inactiveColor={item.inactiveColor}
          />
          {item.label}
          {item.right && <span className="ml-auto">{item.right}</span>}
        </>
      )}
      footer={<SidePopover card={hoverCard} />}
    />
  )
}
