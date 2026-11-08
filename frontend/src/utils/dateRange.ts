const DAY_MS = 86400000

export function isoToDay(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number)

  return Date.UTC(year, month - 1, day) / DAY_MS
}

export function dayToIso(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10)
}