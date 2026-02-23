'use client'

import React, { useEffect, useRef } from 'react'

interface PanelProps {
  id: string
  title: string
  position: { x: number; y: number }
  width?: number
  open?: boolean
  onToggle?: () => void
  onActivate?: (panelId: string) => void
  onHeightChange?: (panelId: string, height: number) => void
  draggable?: boolean
  onDragStart: (panelId: string, e: React.MouseEvent) => void
  zIndex?: number
  maxBodyHeight?: number
  scrollable?: boolean
  showToggle?: boolean
  children: React.ReactNode
}

export function Panel({
  id,
  title,
  position,
  width = 180,
  open = true,
  onToggle,
  onActivate,
  onHeightChange,
  draggable = true,
  onDragStart,
  zIndex = 40,
  maxBodyHeight,
  scrollable = false,
  showToggle = true,
  children,
}: PanelProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onHeightChange) return
    const node = rootRef.current
    if (!node) return
    const emit = () => onHeightChange(id, node.getBoundingClientRect().height)
    emit()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(emit)
    ro.observe(node)
    return () => ro.disconnect()
  }, [id, onHeightChange, open])

  return (
    <div
      ref={rootRef}
      className="fixed font-mono text-[10px]"
      style={{ left: position.x, top: position.y, width, zIndex }}
      onMouseDownCapture={() => onActivate?.(id)}
    >
      <div
        className="relative"
        style={{
          border: '1px solid rgba(16,255,80,0.1)',
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
          background: scrollable
            ? undefined
            : 'linear-gradient(180deg, rgba(16,255,80,0.02) 0%, rgba(8,8,15,0.95) 40%)',
          ...(scrollable ? {
            backgroundColor: 'rgba(8,8,15,0.95)',
            backdropFilter: 'blur(4px)',
            maxHeight: maxBodyHeight || 'calc(100vh - 80px)',
            overflowY: 'auto' as const,
          } : {}),
        }}
      >
        {/* Corner accent marks */}
        <div className="absolute top-0 left-0 w-3 h-[1px] bg-[#10ff50]/40" />
        <div className="absolute top-0 left-0 w-[1px] h-3 bg-[#10ff50]/40" />

        {/* Drag handle header */}
        <div
          className="group w-full flex items-center gap-2 px-3 py-2"
          style={{ cursor: draggable ? 'grab' : 'default' }}
          onMouseDown={e => {
            if (draggable) onDragStart(id, e)
          }}
        >
          <div className="flex flex-col gap-[2px] mr-1 opacity-0 group-hover:opacity-40 transition-opacity">
            <div className="w-3 h-[1px] bg-[#10ff50]" />
            <div className="w-3 h-[1px] bg-[#10ff50]" />
            <div className="w-3 h-[1px] bg-[#10ff50]" />
          </div>
          <span
            className="text-[8px] tracking-[0.3em] uppercase"
            style={{ color: '#10ff50', textShadow: '0 0 6px rgba(16,255,80,0.3)' }}
          >
            {title}
          </span>
          {showToggle && onToggle && (
            <button
              className="ml-auto"
              onClick={e => { e.stopPropagation(); onToggle() }}
            >
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                style={{
                  transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="#10ff50" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapsible body */}
        {showToggle ? (
          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: open ? (maxBodyHeight || 500) : 0, opacity: open ? 1 : 0 }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
