function formatDate(value: string): string {
  const [year, month, day] = value.split('-')

  return `${day}.${month}.${year}`
}

export function formatDateRange(startDate: string, endDate: string | null): string {
  return endDate
    ? `${formatDate(startDate)} – ${formatDate(endDate)}`
    : formatDate(startDate)
}