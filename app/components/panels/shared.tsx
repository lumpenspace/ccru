'use client'

import React from 'react'
import { createPortal } from 'react-dom'

export function PanelList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-3 pb-2.5 space-y-0.5 ${className}`}>{children}</div>
}

interface PanelRowProps {
  children: React.ReactNode
  onClick?: () => void
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: () => void
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

export function PanelRow({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  opacity = 1,
  className = '',
  style,
}: PanelRowProps) {
  return (
    <div
      className={`flex items-center gap-2 py-0.5 cursor-pointer ${className}`}
      style={{ opacity, transition: 'opacity 0.15s', ...style }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  )
}

export interface SelectableListDisplayProps<T> {
  item: T
  index: number
}

interface SelectableListPanelBaseProps<T> {
  items: readonly T[]
  getKey: (item: T, index: number) => React.Key
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  onItemSelect?: (item: T, index: number) => void
  onItemMouseEnter?: (item: T, index: number, event: React.MouseEvent<HTMLDivElement>) => void
  onItemMouseLeave?: (item: T, index: number) => void
  getItemOpacity?: (item: T, index: number) => number | undefined
  getItemClassName?: (item: T, index: number) => string | undefined
  getItemStyle?: (item: T, index: number) => React.CSSProperties | undefined
}

type SelectableListPanelRendererProps<T> =
  | { itemDisplay: (props: SelectableListDisplayProps<T>) => React.ReactNode; ItemDisplayComponent?: never }
  | { itemDisplay?: never; ItemDisplayComponent: React.ComponentType<SelectableListDisplayProps<T>> }

type SelectableListPanelProps<T> = SelectableListPanelBaseProps<T> & SelectableListPanelRendererProps<T>

export function SelectableListPanel<T>(props: SelectableListPanelProps<T>) {
  const {
    items,
    getKey,
    header,
    footer,
    className,
    onItemSelect,
    onItemMouseEnter,
    onItemMouseLeave,
    getItemOpacity,
    getItemClassName,
    getItemStyle,
  } = props

  const renderItem = ({ item, index }: SelectableListDisplayProps<T>): React.ReactNode => {
    if ('itemDisplay' in props && props.itemDisplay) {
      return props.itemDisplay({ item, index })
    }
    const ItemDisplay = props.ItemDisplayComponent
    return <ItemDisplay item={item} index={index} />
  }

  return (
    <PanelList className={className}>
      {header}
      {items.map((item, index) => (
        <PanelRow
          key={getKey(item, index)}
          className={getItemClassName?.(item, index)}
          style={getItemStyle?.(item, index)}
          opacity={getItemOpacity?.(item, index)}
          onClick={onItemSelect ? () => onItemSelect(item, index) : undefined}
          onMouseEnter={onItemMouseEnter ? e => onItemMouseEnter(item, index, e) : undefined}
          onMouseLeave={onItemMouseLeave ? () => onItemMouseLeave(item, index) : undefined}
        >
          {renderItem({ item, index })}
        </PanelRow>
      ))}
      {footer}
    </PanelList>
  )
}

interface PanelColorBarProps {
  color: string
  active: boolean
  inactiveColor?: string
  glow?: boolean
  className?: string
}

export function PanelColorBar({
  color,
  active,
  inactiveColor,
  glow = true,
  className = '',
}: PanelColorBarProps) {
  return (
    <div
      className={`w-1 h-3 flex-shrink-0 transition-all ${className}`}
      style={{
        background: active ? color : (inactiveColor || `${color}44`),
        boxShadow: active && glow ? `0 0 4px ${color}66` : 'none',
      }}
    />
  )
}

interface PanelCountToggleButtonProps {
  selectedCount: number
  total: number
  onClick: () => void
}

export function PanelCountToggleButton({ selectedCount, total, onClick }: PanelCountToggleButtonProps) {
  const all = selectedCount === total
  const partial = selectedCount > 0 && !all
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 w-full py-1 mb-0.5 transition-all hover:opacity-100"
      style={{ opacity: selectedCount > 0 ? 0.7 : 0.4 }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        {all ? (
          <>
            <rect x="1" y="1" width="14" height="14" rx="1" stroke="#10ff50" strokeWidth="1" fill="none" />
            <path d="M4 8L7 11L12 5" stroke="#10ff50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <rect x="1" y="1" width="14" height="14" rx="1" stroke="#555" strokeWidth="1" fill="none" />
            {partial && <rect x="4" y="4" width="8" height="8" rx="0.5" fill="#555" opacity="0.5" />}
          </>
        )}
      </svg>
      <span className="text-[8px] tracking-[0.15em] uppercase font-mono" style={{ color: all ? '#10ff50' : '#555' }}>
        {all ? 'all' : selectedCount > 0 ? `${selectedCount}/${total}` : 'none'}
      </span>
    </button>
  )
}

export function SidePopover({
  card,
}: {
  card: { text: string; color: string; x: number; y: number } | null
}) {
  if (!card || typeof document === 'undefined') return null
  return createPortal(
    <div
      className="fixed z-[95] pointer-events-none max-w-[280px] px-2 py-1.5 text-[8px] leading-relaxed italic"
      style={{
        left: card.x,
        top: card.y,
        transform: 'translateY(-50%)',
        color: `${card.color}cc`,
        border: `1px solid ${card.color}44`,
        background: 'linear-gradient(180deg, rgba(8,12,20,0.95) 0%, rgba(4,7,13,0.96) 100%)',
        boxShadow: `0 0 12px ${card.color}22`,
        backdropFilter: 'blur(2px)',
      }}
    >
      {card.text}
    </div>
    ,
    document.body
  )
}
