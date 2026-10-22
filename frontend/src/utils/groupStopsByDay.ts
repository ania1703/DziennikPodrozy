import type { TripStop } from '../api/useTripStops'

export interface StopDay {
  date: string
  dayNumber: number
  stops: TripStop[]
}

function toDayCount(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number)

  return Date.UTC(year, month - 1, day) / 86400000
}

export function getDayNumber(date: string, tripStartDate: string): number {
  return toDayCount(date) - toDayCount(tripStartDate) + 1
}

export function groupStopsByDay(stops: TripStop[], tripStartDate: string): StopDay[] {
  const days: StopDay[] = []

  for (const stop of stops) {
    let day = days.find((d) => d.date === stop.date)

    if (!day) {
      day = {
        date: stop.date,
        dayNumber: getDayNumber(stop.date, tripStartDate),
        stops: [],
      }

      days.push(day)
    }

    day.stops.push(stop)
  }

  return days
}