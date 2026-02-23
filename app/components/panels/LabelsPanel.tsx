'use client'

import React from 'react'
import type { LabelVisibility } from '../../data/types'
import { HoverInfoList, type HoverInfoListItem } from './HoverInfoList'

interface LabelsPanelProps {
  labels: LabelVisibility
  onToggleLabel: (key: keyof LabelVisibility) => void
}

const LABEL_DEFS: { id: keyof LabelVisibility; label: string; clr: string; info: string }[] = [
  {
    id: 'numbers',
    label: 'Numbers',
    clr: '#44a3ff',
    info: 'Show or hide numeric zone ids (0-9) on the diagram.',
  },
  {
    id: 'xenotation',
    label: 'Tic Xenotation',
    clr: '#cc88ff',
    info: 'Show or hide tic xenotation strings for each zone.',
  },
  {
    id: 'planets',
    label: 'Planets',
    clr: '#e8e8e8',
    info: 'Show or hide planetary labels/symbols on zone nodes.',
  },
]

export function LabelsPanel({ labels, onToggleLabel }: LabelsPanelProps) {
  const items: HoverInfoListItem[] = LABEL_DEFS.map(def => ({
    id: def.id,
    color: def.clr,
    active: labels[def.id],
    info: def.info,
    onClick: () => onToggleLabel(def.id),
    inactiveColor: '#333',
    label: <span className="text-gray-400 text-[10px]">{def.label}</span>,
    right: <span className="text-[8px] text-gray-700">{labels[def.id] ? 'ON' : 'OFF'}</span>,
  }))

  return <HoverInfoList items={items} />
}
