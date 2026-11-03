import { useEffect, useState } from 'react'

export function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduceMotion ? 0 : durationMs
    const startedAt = performance.now()
    let frame = 0

    function tick(now: number) {
      const progress = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(target * eased)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}