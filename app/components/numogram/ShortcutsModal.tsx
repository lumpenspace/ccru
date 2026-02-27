'use client'

import React from 'react'

interface ShortcutsModalProps {
  open: boolean
  onClose: () => void
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[84] flex items-center justify-center px-4">
      <button
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.62)' }}
        onClick={onClose}
        aria-label="Close shortcuts"
      />
      <div
        className="relative w-full max-w-[540px] px-4 py-4 font-mono"
        style={{
          border: '1px solid rgba(16,255,80,0.28)',
          background: 'linear-gradient(180deg, rgba(10,14,24,0.94) 0%, rgba(4,8,14,0.97) 100%)',
          boxShadow: '0 0 28px rgba(16,255,80,0.08)',
        }}
      >
        <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(16,255,80,0.14)' }}>
          <span className="text-[10px] tracking-[0.22em] uppercase" style={{ color: '#10ff50' }}>
            Shortcuts
          </span>
          <button
            className="text-[8px] uppercase tracking-[0.14em] px-2 py-1"
            style={{ color: '#6b7280', border: '1px solid rgba(107,114,128,0.35)' }}
            onClick={onClose}
          >
            close
          </button>
        </div>
        <div className="pt-3 grid gap-1.5 text-[10px]" style={{ color: '#9ca3af' }}>
          <div><span style={{ color: '#10ff50' }}>Mouse:</span> click+drag select, alt+drag pan, scroll zoom</div>
          <div><span style={{ color: '#10ff50' }}>Layout:</span> A original, S labyrinth, D ladder, F planetary</div>
          <div><span style={{ color: '#10ff50' }}>Planetary:</span> Z orbit, X today, C reset, V orbits</div>
          <div><span style={{ color: '#10ff50' }}>Selection:</span> digits 0-9 toggle corresponding gate, Esc clears selection</div>
          <div><span style={{ color: '#10ff50' }}>History:</span> Cmd/Ctrl+Z undo, Shift+Cmd/Ctrl+Z redo, Ctrl+Y redo</div>
          <div><span style={{ color: '#10ff50' }}>Overlay:</span> Shift+/ toggles this shortcuts panel</div>
        </div>
      </div>
    </div>
  )
}
