const FALLBACK_COLORS = ['#5B7B6F', '#968064', '#7C8B6B', '#6B7F8E']

export function getTripFallbackColor(tripId: number): string {
  return FALLBACK_COLORS[tripId % FALLBACK_COLORS.length]
}