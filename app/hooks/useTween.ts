import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { Pos, Layout } from '../data/types'
import { P_ORIGINAL, P_LABYRINTH, P_LADDER, CENTER } from '../data/positions'
import { easeInOutCubic } from '../lib/easing'
import { computePlanetaryPositions } from '../lib/planetary'

const TWEEN_DURATION = 600

export function useTween(layout: Layout, planetaryAngles: Record<number, number>) {
  const [tweenProgress, setTweenProgress] = useState(1)
  const [tweenId, setTweenId] = useState(0)
  const tweenFromPosRef = useRef<Record<number, Pos>>(P_ORIGINAL)
  const tweenFromCtrRef = useRef<Pos>(CENTER.original)
  const tweenFromHeightRef = useRef(940)
  const currentPosRef = useRef<Record<number, Pos>>(P_ORIGINAL)
  const currentCtrRef = useRef<Pos>(CENTER.original)
  const currentHeightRef = useRef(940)
  const tweenAnimRef = useRef<number>(0)

  useEffect(() => {
    if (tweenId === 0) return
    const startTime = performance.now()
    const animate = () => {
      const elapsed = performance.now() - startTime
      const t = Math.min(1, elapsed / TWEEN_DURATION)
      setTweenProgress(t)
      if (t < 1) {
        tweenAnimRef.current = requestAnimationFrame(animate)
      }
    }
    tweenAnimRef.current = requestAnimationFrame(animate)
    return () => { if (tweenAnimRef.current) cancelAnimationFrame(tweenAnimRef.current) }
  }, [tweenId])

  const planetaryPos = useMemo(() => computePlanetaryPositions(planetaryAngles), [planetaryAngles])

  const targetPos = layout === 'labyrinth' ? P_LABYRINTH
    : layout === 'ladder' ? P_LADDER
    : layout === 'planetary' ? planetaryPos
    : P_ORIGINAL
  const targetCtr = CENTER[layout]
  const targetHeight = layout === 'original' ? 940 : layout === 'planetary' ? 800 : layout === 'labyrinth' ? 880 : 870

  const pos = useMemo(() => {
    if (tweenProgress >= 1) return targetPos
    const e = easeInOutCubic(tweenProgress)
    const result: Record<number, Pos> = {}
    for (let z = 0; z <= 9; z++) {
      result[z] = {
        x: tweenFromPosRef.current[z].x + (targetPos[z].x - tweenFromPosRef.current[z].x) * e,
        y: tweenFromPosRef.current[z].y + (targetPos[z].y - tweenFromPosRef.current[z].y) * e,
      }
    }
    return result
  }, [targetPos, tweenProgress])

  const ctr = useMemo(() => {
    if (tweenProgress >= 1) return targetCtr
    const e = easeInOutCubic(tweenProgress)
    return {
      x: tweenFromCtrRef.current.x + (targetCtr.x - tweenFromCtrRef.current.x) * e,
      y: tweenFromCtrRef.current.y + (targetCtr.y - tweenFromCtrRef.current.y) * e,
    }
  }, [targetCtr, tweenProgress])

  const svgHeight = tweenProgress >= 1 ? targetHeight
    : tweenFromHeightRef.current + (targetHeight - tweenFromHeightRef.current) * easeInOutCubic(tweenProgress)

  // Track current displayed state for tween capture
  currentPosRef.current = pos
  currentCtrRef.current = ctr
  currentHeightRef.current = svgHeight

  const switchLayout = useCallback(() => {
    tweenFromPosRef.current = { ...currentPosRef.current }
    tweenFromCtrRef.current = { ...currentCtrRef.current }
    tweenFromHeightRef.current = currentHeightRef.current
    setTweenProgress(0)
    setTweenId(id => id + 1)
  }, [])

  return { pos, ctr, svgHeight, planetaryPos, switchLayout }
}
