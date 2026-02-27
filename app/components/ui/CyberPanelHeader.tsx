'use client'

import React from 'react'

type CyberPanelHeaderProps = {
  title: React.ReactNode
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  className?: string
  titleClassName?: string
  onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void
  role?: React.AriaRole
  tabIndex?: number
  ariaExpanded?: boolean
  style?: React.CSSProperties
}

export function CyberPanelHeader({
  title,
  leftSlot,
  rightSlot,
  className = '',
  titleClassName = 'text-[10px] uppercase tracking-[0.16em] text-gray-400',
  onMouseDown,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ariaExpanded,
  style,
}: CyberPanelHeaderProps) {
  return (
    <header
      className={`flex w-full items-center gap-2 ${className}`}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-expanded={ariaExpanded}
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
