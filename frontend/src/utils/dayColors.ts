const FIRST_HUE = 18
const HUE_STEP = 137.5
const SATURATION = 43
const LIGHTNESS = 35

export function getDayColor(dayNumber: number): string {
  const rawHue = FIRST_HUE + (dayNumber - 1) * HUE_STEP
  const hue = Math.round(((rawHue % 360) + 360) % 360)

  return `hsl(${hue}, ${SATURATION}%, ${LIGHTNESS}%)`
}