'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CyberPanelHeader } from './CyberPanelHeader'

type PositionMode = 'fixed' | 'absolute' | 'relative'

export interface CyberPanelProps {
  id: string
  title: string
  position: { x: number; y: number }
  width?: number | string
  open?: boolean
  onToggle?: () => void
  collapsible?: boolean
  defaultOpen?: boolean
  onActivate?: (panelId: string) => void
  onHeightChange?: (panelId: string, height: number) => void
  draggable?: boolean
  onDragStart: (panelId: string, e: React.MouseEvent) => void
  zIndex?: number
  maxBodyHeight?: number
  scrollable?: boolean
  showToggle?: boolean
  headerRight?: React.ReactNode
  positionMode?: PositionMode
  children: React.ReactNode
}

export function CyberPanel({
  id,
  title,
  position,
  width = 180,
  open,
  onToggle,
  collapsible = false,
  defaultOpen,
  onActivate,
  onHeightChange,
  draggable = true,
  onDragStart,
  zIndex = 40,
  maxBodyHeight,
  scrollable = false,
  showToggle = true,
  headerRight,
  positionMode = 'fixed',
  children,
}: CyberPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalOpen, setInternalOpen] = useState<boolean>(() => defaultOpen ?? open ?? true)
  const isControlled = typeof onToggle === 'function' && typeof open === 'boolean'
  const isOpen = isControlled
    ? open
    : collapsible
      ? internalOpen
      : open ?? true
  const canToggle = showToggle && (typeof onToggle === 'function' || collapsible)

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
      return
    }
    if (collapsible) setInternalOpen(prev => !prev)
  }

  useEffect(() => {
    if (isControlled) return
    if (typeof open !== 'boolean') return
    setInternalOpen(open)
  }, [isControlled, open])

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
  }, [id, isOpen, onHeightChange])

  return (
    <div
      ref={rootRef}
      className="font-mono text-[10px]"
      style={{
        position: positionMode,
        left: positionMode === 'relative' ? undefined : position.x,
        top: positionMode === 'relative' ? undefined : position.y,
        width,
        zIndex,
      }}
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
          ...(scrollable
            ? {
                backgroundColor: 'rgba(8,8,15,0.95)',
                backdropFilter: 'blur(4px)',
                maxHeight: maxBodyHeight || 'calc(100vh - 80px)',
                overflowY: 'auto' as const,
              }
            : {}),
        }}
      >
        <div className="absolute left-0 top-0 h-[1px] w-3 bg-[#10ff50]/40" />
        <div className="absolute left-0 top-0 h-3 w-[1px] bg-[#10ff50]/40" />

        <CyberPanelHeader
          title={title}
          className="group px-3 py-2"
          titleClassName="text-[8px] uppercase tracking-[0.3em]"
          style={{
            color: '#10ff50',
            textShadow: '0 0 6px rgba(16,255,80,0.3)',
            cursor: draggable ? 'grab' : 'default',
          }}
          onMouseDown={e => {
            if (draggable) onDragStart(id, e)
          }}
          leftSlot={draggable ? (
            <div className="mr-1 flex flex-col gap-[2px] opacity-0 transition-opacity group-hover:opacity-40">
              <div className="h-[1px] w-3 bg-[#10ff50]" />
              <div className="h-[1px] w-3 bg-[#10ff50]" />
              <div className="h-[1px] w-3 bg-[#10ff50]" />
            </div>
          ) : undefined}
          rightSlot={(headerRight || canToggle) ? (
            <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
              {headerRight}
              {canToggle && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleToggle()
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    style={{
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path
                      d="M2 3.5L5 6.5L8 3.5"
                      stroke="#10ff50"
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  </svg>
                </button>
              )}
            </div>
          ) : undefined}
        />

        {showToggle ? (
          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: isOpen ? maxBodyHeight || 500 : 0, opacity: isOpen ? 1 : 0 }}
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
