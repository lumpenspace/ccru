'use client'

import React, { useEffect, useRef, useState } from 'react'

type GlitchTextProps = {
  text: string
  color?: string
  className?: string
}

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:<>?/~'

export function GlitchText({ text, color = '#10ff50', className = '' }: GlitchTextProps) {
  const [display, setDisplay] = useState(text)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 180
    const target = text.split('')

    const tick = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(1, elapsed / duration)
      const resolvedCount = Math.floor(progress * target.length)

      const next = target.map((char, index) => {
        if (index < resolvedCount) return char
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      }).join('')

      setDisplay(next)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [text])

  return (
    <span
      className={`ui-glitch-text font-bold uppercase tracking-[0.12em] text-xs ${className}`}
      style={{
        color,
        textShadow: `0 0 8px ${color}66, 0 0 20px ${color}22`,
      }}
    >
      {display}
    </span>
  )
}

