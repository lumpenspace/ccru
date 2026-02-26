'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

export interface PanelGroupItem {
  id: string
  title: React.ReactNode
  color?: string
  content: React.ReactNode
  onRemove?: () => void
  onHoverStart?: () => void
  onHoverEnd?: () => void
}

interface PanelGroupProps {
  heading?: React.ReactNode
  items: PanelGroupItem[]
  className?: string
  openLastOnItemsChange?: boolean
  collapsible?: boolean
  open?: boolean
  defaultOpen?: boolean
  onToggle?: () => void
}

export function PanelGroup({
  heading,
  items,
  className = '',
  openLastOnItemsChange = false,
  collapsible = false,
  open,
  defaultOpen = true,
  onToggle,
}: PanelGroupProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [openId, setOpenId] = useState<string | null>(null)
  const isControlled = typeof onToggle === 'function' && typeof open === 'boolean'
  const isOpen = isControlled ? open : collapsible ? internalOpen : true
  const idsKey = useMemo(() => items.map(i => i.id).join('|'), [items])
  const prevIdsKeyRef = useRef<string>('')

  useEffect(() => {
    if (isControlled) return
    if (typeof open !== 'boolean') return
    setInternalOpen(open)
  }, [isControlled, open])

  useEffect(() => {
    const changed = prevIdsKeyRef.current !== idsKey
    prevIdsKeyRef.current = idsKey
    if (items.length === 0) {
      setOpenId(null)
      return
    }
    if (!changed) return
    if (openLastOnItemsChange) {
      setOpenId(items[items.length - 1].id)
      return
    }
    setOpenId(prev => (prev && items.some(i => i.id === prev) ? prev : items[0].id))
  }, [idsKey, items, openLastOnItemsChange])

  const toggleGroupOpen = () => {
    if (!collapsible) return
    if (onToggle) {
      onToggle()
      return
    }
    setInternalOpen(prev => !prev)
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {collapsible ? (
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
          style={{
            border: '1px solid rgba(16,255,80,0.14)',
            background: 'linear-gradient(180deg, rgba(10,14,22,0.62) 0%, rgba(5,8,14,0.72) 100%)',
            color: 'rgba(16,255,80,0.78)',
          }}
          onClick={toggleGroupOpen}
          aria-label={isOpen ? 'Collapse panel group' : 'Expand panel group'}
        >
          <span className="text-[8px] tracking-[0.13em] uppercase font-mono truncate">
            {heading || 'Panel Group'}
          </span>
          <span className="ml-auto text-[9px] leading-none text-[#10ff50]/70">
            {isOpen ? '\u25BE' : '\u25B8'}
          </span>
        </button>
      ) : (
        heading && <div>{heading}</div>
      )}

      <div
        className={collapsible ? 'space-y-1.5 overflow-hidden transition-all duration-200' : 'space-y-1.5'}
        style={collapsible ? { maxHeight: isOpen ? 8000 : 0, opacity: isOpen ? 1 : 0 } : undefined}
      >
        {items.map(item => {
          const isItemOpen = openId === item.id
          const color = item.color || '#10ff50'
          return (
            <div key={item.id}
              className="relative"
              style={{
                border: '1px solid rgba(16,255,80,0.14)',
                background: 'linear-gradient(180deg, rgba(10,14,22,0.62) 0%, rgba(5,8,14,0.72) 100%)',
                overflow: 'visible',
              }}
              onMouseEnter={() => item.onHoverStart?.()}
              onMouseLeave={() => item.onHoverEnd?.()}
            >
              <div className="absolute top-0 left-0 w-2 h-[1px]" style={{ background: `${color}44` }} />
              <div className="absolute top-0 left-0 w-[1px] h-2" style={{ background: `${color}44` }} />
              <div className="w-full flex items-center gap-2 px-2 py-1.5">
                <button
                  className="min-w-0 flex-1 flex items-center gap-2 text-left"
                  onClick={() => setOpenId(prev => (prev === item.id ? null : item.id))}
                >
                  <span className="inline-block w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 4px ${color}88` }} />
                  <span className="text-[8px] tracking-[0.13em] uppercase font-mono truncate"
                    style={{ color: `${color}cc` }}
                  >{item.title}</span>
                </button>
                {item.onRemove && (
                  <button
                    className="text-[9px] leading-none px-1 py-0.5"
                    style={{ color: `${color}99` }}
                    onClick={e => {
                      e.stopPropagation()
                      item.onRemove?.()
                    }}
                    aria-label={`Remove ${typeof item.title === 'string' ? item.title : 'item'}`}
                  >
                    x
                  </button>
                )}
                <button
                  className="text-[9px] leading-none"
                  style={{ color: `${color}88` }}
                  onClick={() => setOpenId(prev => (prev === item.id ? null : item.id))}
                  aria-label={isItemOpen ? 'Collapse item' : 'Expand item'}
                >
                  {isItemOpen ? '\u25BE' : '\u25B8'}
                </button>
              </div>
              <div
                className="transition-all duration-200"
                style={{
                  maxHeight: isItemOpen ? 2800 : 0,
                  opacity: isItemOpen ? 1 : 0,
                  overflow: isItemOpen ? 'visible' : 'hidden',
                }}
              >
                <div className="px-2 pb-2 pt-0.5">
                  {item.content}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
