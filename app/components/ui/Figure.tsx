'use client'

import React, { useMemo, useState } from 'react'
import { formatXenotationForDisplay } from '../../lib/xenotation'

export type FigureDisplaySystem = 'decimal' | 'binary' | 'tic-xenotation'

type FigureProps = {
  title: string
  value: string | number
  accent?: string
  className?: string
  size?: 'md' | 'sm'
  align?: 'left' | 'center'
  showDisplaySystem?: boolean
  displaySystem?: FigureDisplaySystem
  restDisplaySystem?: FigureDisplaySystem
  hoverDisplaySystem?: FigureDisplaySystem
}

function formatFigureValue(value: number, system: FigureDisplaySystem): string {
  if (!Number.isFinite(value)) return String(value)
  const integer = Number.isInteger(value)
  if (system === 'decimal') return integer ? value.toLocaleString() : String(value)
  if (system === 'binary') {
    if (!integer) return String(value)
    const sign = value < 0 ? '-' : ''
    return `${sign}${Math.abs(value).toString(2)}`
  }
  if (!integer) return String(value)
  if (value === 0) return '0'
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  const xeno = formatXenotationForDisplay(abs)
  return `${sign}${xeno || abs.toLocaleString()}`
}

function displaySystemLabel(system: FigureDisplaySystem): string {
  if (system === 'binary') return 'bin'
  if (system === 'tic-xenotation') return 'tic'
  return 'dec'
}

export function Figure({
  title,
  value,
  accent = '#10ff50',
  className = '',
  size = 'md',
  align = 'left',
  showDisplaySystem = false,
  displaySystem = 'decimal',
  restDisplaySystem,
  hoverDisplaySystem,
}: FigureProps) {
  const [hovered, setHovered] = useState(false)
  const isNumeric = typeof value === 'number'
  const restSystem = restDisplaySystem ?? displaySystem
  const hoverSystem = hoverDisplaySystem ?? restSystem
  const activeSystem = hovered ? hoverSystem : restSystem
  const showSystemBadge = showDisplaySystem && isNumeric && (restSystem !== 'decimal' || hoverSystem !== restSystem)
  const isSmall = size === 'sm'
  const centered = align === 'center'

  const renderedValue = useMemo(() => {
    if (!isNumeric) return value
    return formatFigureValue(value, activeSystem)
  }, [activeSystem, isNumeric, value])

  return (
    <div
      className={`border ${isSmall ? 'px-2 py-1.5' : 'px-2.5 py-2'} ${className}`}
      style={{
        borderColor: `${accent}4d`,
        background: `${accent}11`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`flex items-start gap-2 ${centered && !showSystemBadge ? 'justify-center' : 'justify-between'}`}>
        <div className={`${isSmall ? 'text-[9px]' : 'text-[10px]'} uppercase tracking-[0.14em] ${centered ? 'text-center' : ''}`} style={{ color: `${accent}cc` }}>
          {title}
        </div>
        {showSystemBadge && (
          <div className={`${isSmall ? 'text-[8px]' : 'text-[9px]'} uppercase tracking-[0.14em] text-gray-500`}>
            {displaySystemLabel(activeSystem)}
          </div>
        )}
      </div>
      <div className={`${isSmall ? 'mt-0.5 text-sm' : 'mt-1 text-base'} font-semibold leading-none text-gray-100 ${centered ? 'text-center' : ''}`}>
        {renderedValue}
      </div>
    </div>
  )
}
