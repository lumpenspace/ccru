'use client'

import React from 'react'

type CyberPanelHeaderProps = {
  title: React.ReactNode
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  className?: string
  titleClassName?: string
  onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void
  style?: React.CSSProperties
}

export function CyberPanelHeader({
  title,
  leftSlot,
  rightSlot,
  className = '',
  titleClassName = 'text-[10px] uppercase tracking-[0.16em] text-gray-400',
  onMouseDown,
  style,
}: CyberPanelHeaderProps) {
  return (
    <header
      className={`flex w-full items-center gap-2 ${className}`}
      onMouseDown={onMouseDown}
      style={style}
    >
      {leftSlot}
      <span className={titleClassName}>{title}</span>
      {rightSlot && (
        <div className="ml-auto flex items-center gap-1">
          {rightSlot}
        </div>
      )}
    </header>
  )
}
