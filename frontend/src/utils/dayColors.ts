const DAY_COLORS = ['#7F4A33', '#3F6F5E', '#2F5D7C', '#8E3B5C', '#A0671A', '#5B4B8A']

export function getDayColor(dayNumber: number): string {
  const index = (((dayNumber - 1) % DAY_COLORS.length) + DAY_COLORS.length) % DAY_COLORS.length

  return DAY_COLORS[index]
}