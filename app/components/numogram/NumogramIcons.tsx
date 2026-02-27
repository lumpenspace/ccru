'use client'

import React from 'react'

interface IconProps {
  clr: string
}

export function OriginalIcon({ clr }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <polygon
        points={Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 - 90) * Math.PI / 180
          const r = i % 2 === 0 ? 11 : 5.5
          return `${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`
        }).join(' ')}
        fill="none" stroke={clr} strokeWidth="1.2" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.5" fill={clr} opacity="0.6" />
    </svg>
  )
}

export function LabyrinthIcon({ clr }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 C18 3 21 6 21 12 C21 18 17 21 12 21 C7 21 4.5 17.5 4.5 12 C4.5 7.5 7.5 5 12 5 C16 5 18.5 7.5 18.5 12 C18.5 16 15.5 18.5 12 18.5 C8.5 18.5 7 15.5 7 12 C7 9 9 7.5 12 7.5 C14.5 7.5 16 9.5 16 12 C16 14 14 15.5 12 15.5 C10.5 15.5 9.5 14 9.5 12 C9.5 10.5 10.5 9.5 12 9.5"
        stroke={clr} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function LadderIcon({ clr }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <line x1="8" y1="4" x2="8" y2="22" stroke={clr} strokeWidth="1.2" />
      <line x1="16" y1="4" x2="16" y2="22" stroke={clr} strokeWidth="1.2" />
      {[7, 11, 15, 19].map(y => (
        <line key={y} x1="8" y1={y} x2="16" y2={y} stroke={clr} strokeWidth="0.8" opacity="0.6" />
      ))}
      <path d="M8.5 3.5 Q12 0 15.5 3.5" stroke={clr} strokeWidth="0.9" fill="none" />
      <path d="M8.5 3.5 Q12 6 15.5 3.5" stroke={clr} strokeWidth="0.9" fill="none" />
      <circle cx="12" cy="3.5" r="1" fill={clr} opacity="0.7" />
    </svg>
  )
}

export function PlanetaryIcon({ clr }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke={clr} strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="12" r="1.5" fill={clr} opacity="0.5" />
      <line x1="12" y1="7" x2="12" y2="17" stroke={clr} strokeWidth="0.7" opacity="0.4" />
      <line x1="7" y1="12" x2="17" y2="12" stroke={clr} strokeWidth="0.7" opacity="0.4" />
      <ellipse cx="12" cy="12" rx="10.5" ry="10.5" stroke={clr} strokeWidth="0.6" strokeDasharray="2 2.5" opacity="0.5" />
      <circle cx="22" cy="10" r="1.8" fill={clr} opacity="0.6" />
    </svg>
  )
}

export function OrbitIcon({ clr }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5C16.4 5 20 8.1 20 12C20 15.9 16.4 19 12 19C7.6 19 4 15.9 4 12C4 8.1 7.6 5 12 5" stroke={clr} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M18.5 7L20 5M20 5L18 5.5M20 5L19.5 7" stroke={clr} strokeWidth="1" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill={clr} opacity="0.5" />
    </svg>
  )
}

export function TodayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10.5" stroke="#555" strokeWidth="0.8" fill="none" />
      <circle cx="12" cy="12" r="7.5" stroke="#555" strokeWidth="0.6" fill="none" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180
        return <line key={i} x1={12 + Math.cos(a) * 7.5} y1={12 + Math.sin(a) * 7.5} x2={12 + Math.cos(a) * 10.5} y2={12 + Math.sin(a) * 10.5} stroke="#555" strokeWidth="0.6" />
      })}
      <line x1="3" y1="12" x2="21" y2="12" stroke="#555" strokeWidth="0.9" />
      <path d="M2 12L5 10.2V13.8Z" fill="#555" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="#555" strokeWidth="0.5" opacity="0.4" />
      <circle cx="12" cy="12" r="1.2" fill="#555" />
    </svg>
  )
}

export function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20C9.2 20 6.8 18.6 5.4 16.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M4 8V12H8" stroke="#555" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function OrbitsIcon({ clr }: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke={clr} strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
      <circle cx="12" cy="12" r="7.5" stroke={clr} strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
      <circle cx="12" cy="12" r="10.5" stroke={clr} strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
      <circle cx="12" cy="12" r="1.5" fill={clr} opacity="0.6" />
    </svg>
  )
}

export function UndoIcon({ clr }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M8 8H4V4" stroke={clr} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 8C6.2 5.1 9.6 3.8 13 4.5C17.2 5.3 20 9 20 13.2C20 17.5 16.6 21 12.3 21C9.1 21 6.3 19.1 5 16.3" stroke={clr} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function RedoIcon({ clr }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M16 8H20V4" stroke={clr} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 8C17.8 5.1 14.4 3.8 11 4.5C6.8 5.3 4 9 4 13.2C4 17.5 7.4 21 11.7 21C14.9 21 17.7 19.1 19 16.3" stroke={clr} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function ShareIcon({ clr }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="2" stroke={clr} strokeWidth="1.2" />
      <circle cx="18" cy="6" r="2" stroke={clr} strokeWidth="1.2" />
      <circle cx="18" cy="18" r="2" stroke={clr} strokeWidth="1.2" />
      <path d="M8 11L16 7" stroke={clr} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 13L16 17" stroke={clr} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
