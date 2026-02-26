'use client'

import React from 'react'

type CyberInputProps = {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

export function CyberInput({ label, value, onChange, placeholder }: CyberInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-gray-400">{label}</span>
      <span className="ui-terminal-field">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="ui-terminal-input w-full px-0 py-2 text-sm text-gray-100"
        />
      </span>
    </label>
  )
}
