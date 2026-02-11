import { useState, useEffect, useRef, type RefObject } from 'react'

export function useCanvasZoom(wrapRef: RefObject<HTMLDivElement | null>) {
  const [zoom, setZoom] = useState(1)
  const zoomOriginRef = useRef<{ x: number; y: number }>({ x: 50, y: 50 })

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = wrap.getBoundingClientRect()
      const ox = ((e.clientX - rect.left) / rect.width) * 100
      const oy = ((e.clientY - rect.top) / rect.height) * 100
      zoomOriginRef.current = { x: ox, y: oy }
      setZoom(prev => Math.min(5, Math.max(0.3, prev - e.deltaY * 0.001)))
    }
    wrap.addEventListener('wheel', handleWheel, { passive: false })
    return () => wrap.removeEventListener('wheel', handleWheel)
  }, [wrapRef])

  return { zoom, zoomOrigin: zoomOriginRef.current }
}
