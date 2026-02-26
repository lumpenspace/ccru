'use client'

import React from 'react'

type CyberRadioProps = {
  checked: boolean
  label: string
  onChange: () => void
  name?: string
  disabled?: boolean
}

export function CyberRadio({
  checked,
  label,
  onChange,
  name,
  disabled = false,
}: CyberRadioProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-xs tracking-[0.12em] uppercase ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border"
        style={{
          borderColor: checked ? 'rgba(16,255,80,0.7)' : 'rgba(107,114,128,0.7)',
          boxShadow: checked ? '0 0 8px rgba(16,255,80,0.3)' : 'none',
        }}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-[#10ff50]" />}
      </span>
      <span style={{ color: checked ? '#10ff50' : '#9ca3af' }}>{label}</span>
    </label>
  )
}

