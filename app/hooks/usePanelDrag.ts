import { useState, useRef, useCallback, useEffect } from 'react'

interface PanelPositions {
  layers: { x: number; y: number }
  regions: { x: number; y: number }
  zones: { x: number; y: number }
  syz: { x: number; y: number }
  currents: { x: number; y: number }
  gates: { x: number; y: number }
}

export function usePanelDrag() {
  const [positions, setPositions] = useState<PanelPositions>({
    layers: { x: 12, y: 64 },
    zones: { x: 206, y: 64 },
    regions: { x: 206, y: 380 },
    syz: { x: 400, y: 64 },
    currents: { x: 400, y: 260 },
    gates: { x: 400, y: 460 },
  })
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

  return { positions, startDrag, canvasPan, startCanvasDrag }
}
