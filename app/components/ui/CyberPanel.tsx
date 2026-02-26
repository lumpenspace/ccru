'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CyberPanelHeader } from './CyberPanelHeader'

type PositionMode = 'fixed' | 'absolute' | 'relative'
type CollapseDirection = 'none' | 'vertical' | 'side'

export interface CyberPanelProps {
  id: string
  title: string
  position: { x: number; y: number }
  width?: number | string
  open?: boolean
  onToggle?: () => void
  defaultOpen?: boolean
  onActivate?: (panelId: string) => void
  onHeightChange?: (panelId: string, height: number) => void
  draggable?: boolean
  onDragStart: (panelId: string, e: React.MouseEvent) => void
  zIndex?: number
  maxBodyHeight?: number
  scrollable?: boolean
  showToggle?: boolean
  collapseDirection?: CollapseDirection
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
  defaultOpen,
  onActivate,
  onHeightChange,
  draggable = true,
  onDragStart,
  zIndex = 40,
  maxBodyHeight,
  scrollable = false,
  showToggle = true,
  collapseDirection = 'none',
  headerRight,
  positionMode = 'fixed',
  children,
}: CyberPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalOpen, setInternalOpen] = useState<boolean>(() => defaultOpen ?? open ?? true)
  const isCollapsible = collapseDirection !== 'none'
  const isControlled = typeof onToggle === 'function' && typeof open === 'boolean'
  const isOpen = isCollapsible
    ? isControlled
      ? open
      : internalOpen
    : true
  const canToggle = isCollapsible
  const showPanelToggle = showToggle && canToggle
  const showHeader = collapseDirection !== 'side'
  const isSideToggle = showPanelToggle && collapseDirection === 'side'
  const isSideClosed = isSideToggle && !isOpen

  const handleToggle = () => {
    if (!isCollapsible) return
    if (onToggle) {
      onToggle()
      return
    }
    setInternalOpen(prev => !prev)
  }

  useEffect(() => {
    if (!isCollapsible || isControlled) return
    if (typeof open !== 'boolean') return
    setInternalOpen(open)
  }, [isCollapsible, isControlled, open])

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
        width: isSideClosed ? 36 : width,
        zIndex,
        transition: isSideToggle ? 'width 0.2s ease' : undefined,
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
            : isSideClosed
              ? 'transparent'
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

        {showHeader && (
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
            rightSlot={(headerRight || (showPanelToggle && collapseDirection !== 'side')) ? (
              <div className="flex items-center gap-1" onMouseDown={e => e.stopPropagation()}>
                {headerRight}
                {showPanelToggle && collapseDirection !== 'side' && (
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
        )}

        {showPanelToggle ? (
          collapseDirection === 'side' ? (
            <div className="flex items-stretch gap-1 px-2 pb-2">
              <div
                className="min-w-0 overflow-hidden transition-all duration-200"
                style={{
                  flex: isOpen ? '1 1 auto' : '0 0 auto',
                  maxWidth: isOpen ? 1600 : 0,
                  maxHeight: maxBodyHeight || 500,
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? 'auto' : 'none',
                }}
              >
                {children}
              </div>
              {showPanelToggle && (
                <button
                  type="button"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => {
                    e.stopPropagation()
                    handleToggle()
                  }}
                  aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
                  className="inline-flex min-h-[96px] w-6 flex-shrink-0 items-center justify-center border border-[#10ff50]/22 bg-[#050a12] text-[#10ff50]/70 transition-all hover:bg-[#0a1220] hover:text-[#10ff50]"
                  style={{
                    clipPath: 'polygon(0 6px, 6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
                  }}
                >
                  <span
                    className="text-[8px] uppercase tracking-[0.12em]"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    {title} {isOpen ? '\u25C2' : '\u25B8'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: isOpen ? maxBodyHeight || 500 : 0, opacity: isOpen ? 1 : 0 }}
            >
              {children}
            </div>
          )
        ) : (
          children
        )}
      </div>
    </div>
  )
}
