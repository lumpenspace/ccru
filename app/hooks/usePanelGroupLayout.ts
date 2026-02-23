import { useCallback, useMemo, useState } from 'react'

interface UsePanelGroupLayoutArgs<T extends string> {
  order: readonly T[]
  defaultHeights: Record<T, number>
  baseX: number
  baseY: number
  gap: number
}

export function usePanelGroupLayout<T extends string>({
  order,
  defaultHeights,
  baseX,
  baseY,
  gap,
}: UsePanelGroupLayoutArgs<T>) {
  const [heights, setHeights] = useState<Record<T, number>>(defaultHeights)

  const onItemHeight = useCallback((itemId: string, height: number) => {
    if (!order.includes(itemId as T)) return
    if (!(height > 0)) return
    const id = itemId as T
    setHeights(prev => {
      if (Math.abs((prev[id] ?? 0) - height) < 0.5) return prev
      return { ...prev, [id]: height }
    })
  }, [order])

  const positions = useMemo(() => {
    let y = baseY
    const out = {} as Record<T, { x: number; y: number }>
    for (const id of order) {
      out[id] = { x: baseX, y }
      y += (heights[id] ?? defaultHeights[id]) + gap
    }
    return out
  }, [order, heights, defaultHeights, baseX, baseY, gap])

  return { positions, onItemHeight }
}

