function toDate(value: string): Date {
  return new Date(value.endsWith('Z') ? value : `${value}Z`)
}

export function formatLastActive(value: string | null): string {
  if (!value) {
    return 'Brak'
  }

  const minutes = Math.floor((Date.now() - toDate(value).getTime()) / 60000)

  if (minutes < 5) {
    return 'Przed chwilą'
  }

  if (minutes < 60) {
    return `${minutes} min temu`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours} godz. temu`
  }

  const days = Math.floor(hours / 24)

  if (days === 1) {
    return 'Wczoraj'
  }

  if (days < 30) {
    return `${days} dni temu`
  }

  return toDate(value).toLocaleDateString('pl-PL')
}

export function formatDay(value: string): string {
  return toDate(value).toLocaleDateString('pl-PL')
}

export function daysSince(value: string): number {
  return (Date.now() - toDate(value).getTime()) / 86400000
}