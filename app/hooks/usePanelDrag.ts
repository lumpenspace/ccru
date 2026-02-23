import { useState, useRef, useCallback, useEffect } from 'react'

interface PanelPositions {
  layers: { x: number; y: number }
  labels: { x: number; y: number }
  regions: { x: number; y: number }
  zones: { x: number; y: number }
  syz: { x: number; y: number }
  currents: { x: number; y: number }
  gates: { x: number; y: number }
  info: { x: number; y: number }
}

type PanelId = keyof PanelPositions

const INITIAL_Z_INDEX: Record<PanelId, number> = {
  layers: 40,
  labels: 41,
  regions: 42,
  zones: 43,
  currents: 44,
  syz: 45,
  gates: 46,
  info: 47,
}

export function usePanelDrag() {
  const [positions, setPositions] = useState<PanelPositions>({
    layers: { x: 12, y: 64 },
    labels: { x: 12, y: 206 },
    zones: { x: 12, y: 352 },
    syz: { x: 12, y: 916 },
    regions: { x: 216, y: 64 },
    currents: { x: 216, y: 258 },
    gates: { x: 216, y: 516 },
    info: { x: 420, y: 64 },
  })
  const [zIndexes, setZIndexes] = useState<Record<PanelId, number>>(INITIAL_Z_INDEX)
  const zCounterRef = useRef(Math.max(...Object.values(INITIAL_Z_INDEX)) + 1)
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{
    panel: string; startX: number; startY: number; origX: number; origY: number
  } | null>(null)
  const canvasDragRef = useRef<{
    startX: number; startY: number; origX: number; origY: number
  } | null>(null)

  // Drag handler for panels + canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasDragRef.current) {
        const { startX, startY, origX, origY } = canvasDragRef.current
        setCanvasPan({ x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) })
        return
      }
      if (!dragRef.current) return
      const { panel, startX, startY, origX, origY } = dragRef.current
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const newPos = { x: origX + dx, y: origY + dy }
      setPositions(prev => ({ ...prev, [panel]: newPos }))
    }
    const handleMouseUp = () => {
      dragRef.current = null
      canvasDragRef.current = null
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const startDrag = useCallback((panel: string, e: React.MouseEvent) => {
    const pos = positions[panel as keyof PanelPositions]
    if (!pos) return
    const id = panel as PanelId
    setZIndexes(prev => ({ ...prev, [id]: zCounterRef.current++ }))
    dragRef.current = {
      panel,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    }
  }, [positions])

  const startCanvasDrag = useCallback((e: React.MouseEvent) => {
    canvasDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: canvasPan.x,
      origY: canvasPan.y,
    }
  }, [canvasPan])

  const activatePanel = useCallback((panel: string) => {
    if (!(panel in positions)) return
    const id = panel as PanelId
    setZIndexes(prev => ({ ...prev, [id]: zCounterRef.current++ }))
  }, [positions])

  const setCanvasPanValue = useCallback((next: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    setCanvasPan(prev => typeof next === 'function' ? (next as (p: { x: number; y: number }) => { x: number; y: number })(prev) : next)
  }, [])

  const setPanelPositions = useCallback((next: PanelPositions | ((prev: PanelPositions) => PanelPositions)) => {
    setPositions(prev => typeof next === 'function'
      ? (next as (p: PanelPositions) => PanelPositions)(prev)
      : next)
  }, [])

  const stackPanels = useCallback((baseX = 10, baseY = 64, rowStep = 42) => {
    setPositions({
      layers: { x: baseX, y: baseY + rowStep * 0 },
      labels: { x: baseX, y: baseY + rowStep * 1 },
      zones: { x: baseX, y: baseY + rowStep * 2 },
      regions: { x: baseX, y: baseY + rowStep * 3 },
      syz: { x: baseX, y: baseY + rowStep * 4 },
      currents: { x: baseX, y: baseY + rowStep * 5 },
      gates: { x: baseX, y: baseY + rowStep * 6 },
      info: { x: baseX, y: baseY + rowStep * 7 },
    })
  }, [])

  return {
    positions,
    zIndexes,
    activatePanel,
    startDrag,
    canvasPan,
    setCanvasPan: setCanvasPanValue,
    setPanelPositions,
    startCanvasDrag,
    stackPanels,
  }
}
