'use client'

import React from 'react'

type CyberTextAreaProps = {
  label: string
  value: string
  onChange: (next: string) => void
  rows?: number
  placeholder?: string
}

export function CyberTextArea({
  label,
  value,
  onChange,
  rows = 6,
  placeholder,
}: CyberTextAreaProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-gray-400">{label}</span>
      <span className="ui-terminal-field ui-terminal-field-area">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="ui-terminal-input ui-terminal-area w-full resize-y px-0 py-2 text-sm leading-6 text-gray-100"
        />
      </span>
    </label>
  )
}
