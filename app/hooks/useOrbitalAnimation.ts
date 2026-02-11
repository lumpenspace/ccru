import { useState, useEffect, useRef } from 'react'
import type { Layout } from '../data/types'
import { ORBITAL_PERIOD } from '../lib/planetary'

export function useOrbitalAnimation(layout: Layout, defaultAngles: Record<number, number>) {
  const [planetaryAngles, setPlanetaryAngles] = useState(defaultAngles)
  const [orbiting, setOrbiting] = useState(false)
  const animRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const accumYearsRef = useRef(0)
  const lastDateUpdateRef = useRef(0)
  const onDateUpdateRef = useRef<((years: number) => void) | null>(null)

  useEffect(() => {
    if (!orbiting || layout !== 'planetary') {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }
    accumYearsRef.current = 0
    lastDateUpdateRef.current = 0
    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time
      const dt = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time
      const yearsPassed = dt / 4
      accumYearsRef.current += yearsPassed
      setPlanetaryAngles(prev => {
        const next = { ...prev }
        for (let z = 1; z <= 9; z++) {
          next[z] = (prev[z] + (360 / ORBITAL_PERIOD[z]) * yearsPassed) % 360
        }
        return next
      })
      // Update date ~4 times per second to avoid excessive re-renders
      if (time - lastDateUpdateRef.current > 250) {
        lastDateUpdateRef.current = time
        onDateUpdateRef.current?.(accumYearsRef.current)
      }
      animRef.current = requestAnimationFrame(animate)
    }
    lastTimeRef.current = 0
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [orbiting, layout])

  return { planetaryAngles, setPlanetaryAngles, orbiting, setOrbiting, onDateUpdateRef }
}
