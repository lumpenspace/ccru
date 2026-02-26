'use client'

import React, { useCallback, useMemo, useState } from 'react'

import { Pill } from './Pill'

type CyberTextAreaProps = {
  label: string
  value: string
  onChange: (next: string) => void
  rows?: number
  placeholder?: string
  pillCollection?: boolean
}

function parseNumericPills(raw: string): number[] {
  const matches = `${raw || ''}`.match(/-?\d+/g)
  if (!matches) return []
  return matches
    .map(chunk => Number(chunk))
    .filter(entry => Number.isFinite(entry))
}

function serializeNumericPills(values: number[]): string {
  return values.join(', ')
}

export function CyberTextArea({
  label,
  value,
  onChange,
  rows = 6,
  placeholder,
  pillCollection = false,
}: CyberTextAreaProps) {
  const [draft, setDraft] = useState('')
  const pills = useMemo(() => (pillCollection ? parseNumericPills(value) : []), [pillCollection, value])

  const removePill = (index: number) => {
    const next = pills.filter((_, pillIndex) => pillIndex !== index)
    onChange(serializeNumericPills(next))
  }

  const appendPills = useCallback((raw: string): boolean => {
    const nextValues = parseNumericPills(raw)
    if (nextValues.length === 0) return false
    onChange(serializeNumericPills([...pills, ...nextValues]))
    return true
  }, [onChange, pills])

  const commitDraft = useCallback(() => {
    appendPills(draft)
    setDraft('')
  }, [appendPills, draft])

  if (pillCollection) {
    return (
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-gray-400">{label}</span>
        <span className="ui-pill-input-field">
          <span className="ui-pill-input-list">
            {pills.map((pill, index) => (
              <Pill
                key={`${pill}-${index}`}
                onClose={() => removePill(index)}
                closeLabel={`Remove ${pill}`}
                className="border-[#374151] bg-[#111827] px-2 py-1 text-[11px] text-gray-100"
              >
                {pill}
              </Pill>
            ))}
          </span>
          <input
            value={draft}
            onChange={event => {
              const next = event.target.value
              if (/[,\s]/.test(next)) {
                appendPills(next)
                setDraft('')
                return
              }
              setDraft(next)
            }}
            onKeyDown={event => {
              if (event.key === 'Backspace' && draft.length === 0 && pills.length > 0) {
                event.preventDefault()
                removePill(pills.length - 1)
                return
              }

              if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',' || event.key === ' ') {
                event.preventDefault()
                commitDraft()
              }
            }}
            onBlur={commitDraft}
            onPaste={event => {
              const pasted = event.clipboardData.getData('text')
              const parsed = parseNumericPills(pasted)
              if (parsed.length === 0) return
              event.preventDefault()
              onChange(serializeNumericPills([...pills, ...parsed]))
              setDraft('')
            }}
            placeholder={placeholder}
            className="ui-pill-input-entry"
          />
        </span>
      </label>
    )
  }

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
