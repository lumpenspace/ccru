import { useState, useEffect, type RefObject } from 'react'

export function useParallax(_ref: RefObject<HTMLDivElement | null>) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx * 6
      const dy = (e.clientY - cy) / cy * 6
      setOffset({ x: dx, y: dy })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return offset
}
