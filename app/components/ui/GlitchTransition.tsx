'use client'

import React, { useEffect, useState } from 'react'

type GlitchTransitionProps = {
  value: string | number
  className?: string
}

export function GlitchTransition({ value, className = '' }: GlitchTransitionProps) {
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    setGlitching(true)
    const timer = window.setTimeout(() => setGlitching(false), 240)
    return () => window.clearTimeout(timer)
  }, [value])

  return (
    <span className={`${glitching ? 'ui-glitch-transition' : ''} ${className}`}>
      {value}
    </span>
  )
}

