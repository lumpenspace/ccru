'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CyberPanelHeader } from './CyberPanelHeader'

type Position = { x: number; y: number }

type CyberContainerProps = {
  title: string
  children: React.ReactNode
  draggable?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  defaultPosition?: Position
  width?: number
  className?: string
}

export function CyberContainer({
  title,
  children,
  draggable = false,
  collapsible = false,
  defaultOpen = true,
  defaultPosition = { x: 0, y: 0 },
  width = 280,
  className = '',
}: CyberContainerProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [pos, setPos] = useState(defaultPosition)
  const [dragging, setDragging] = useState(false)
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 })

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging])

  return (
    <section
      className={`relative border border-[#10ff50]/20 bg-[#0b111a] ${className}`}
      style={{
        width,
        position: draggable ? 'absolute' : 'relative',
        left: draggable ? pos.x : undefined,
        top: draggable ? pos.y : undefined,
      }}
    >
      <CyberPanelHeader
        title={title}
        className="border-b border-[#10ff50]/15 px-2.5 py-2"
        titleClassName="text-[10px] uppercase tracking-[0.16em] text-[#10ff50]"
        style={{ cursor: draggable ? 'grab' : 'default' }}
        onMouseDown={e => {
          if (!draggable) return
          const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
          dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          }
          setDragging(true)
        }}
        rightSlot={collapsible ? (
          <button
            type="button"
            className="text-xs text-gray-400"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => setOpen(v => !v)}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : undefined}
      />
      {(!collapsible || open) && (
        <div className="px-2.5 py-2">
          {children}
        </div>
      )}
    </section>
  )
}
