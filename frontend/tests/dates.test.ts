import { describe, expect, it } from 'vitest'
import { dayToIso, isoToDay } from '../src/utils/dateRange'
import { formatDateRange } from '../src/utils/formatDate'
import { getDayNumber, groupStopsByDay } from '../src/utils/groupStopsByDay'
import type { TripStop } from '../src/api/useTripStops'

function stop(id: number, date: string): TripStop {
  return {
    id,
    title: `Przystanek ${id}`,
    latitude: 50,
    longitude: 19,
    date,
    sortOrder: id,
    note: null,
    photos: [],
    weather: null,
    recordings: [],
  }
}

describe('isoToDay and dayToIso', () => {
  it('start counting at the Unix epoch', () => {
    expect(isoToDay('1970-01-01')).toBe(0)
    expect(dayToIso(0)).toBe('1970-01-01')
  })

  it('round-trip a date', () => {
    expect(dayToIso(isoToDay('2026-12-31'))).toBe('2026-12-31')
    expect(dayToIso(isoToDay('2024-02-29'))).toBe('2024-02-29')
  })

  it('count consecutive days across month and year boundaries', () => {
    expect(isoToDay('2026-03-01') - isoToDay('2026-02-28')).toBe(1)
    expect(isoToDay('2027-01-01') - isoToDay('2026-12-31')).toBe(1)
  })

  it('handle the leap day', () => {
    expect(isoToDay('2024-03-01') - isoToDay('2024-02-28')).toBe(2)
    expect(isoToDay('2026-03-01') - isoToDay('2026-02-28')).toBe(1)
  })

  it('are not affected by daylight saving time changes', () => {
    expect(isoToDay('2026-03-30') - isoToDay('2026-03-28')).toBe(2)
    expect(isoToDay('2026-10-26') - isoToDay('2026-10-24')).toBe(2)
  })

  it('give a whole number of days for every date', () => {
    expect(Number.isInteger(isoToDay('2026-06-15'))).toBe(true)
  })
})

describe('formatDateRange', () => {
  it('formats a range with an en dash', () => {
    expect(formatDateRange('2026-12-20', '2026-12-22')).toBe('20.12.2026 – 22.12.2026')
  })

  it('formats a single date when there is no end', () => {
    expect(formatDateRange('2026-12-20', null)).toBe('20.12.2026')
  })
})

describe('getDayNumber', () => {
  it('is 1 on the first day of the trip', () => {
    expect(getDayNumber('2026-12-20', '2026-12-20')).toBe(1)
  })

  it('counts the following days', () => {
    expect(getDayNumber('2026-12-22', '2026-12-20')).toBe(3)
  })

  it('works across a month boundary', () => {
    expect(getDayNumber('2026-02-02', '2026-01-31')).toBe(3)
  })

  it('works across a year boundary', () => {
    expect(getDayNumber('2027-01-02', '2026-12-30')).toBe(4)
  })
})

describe('groupStopsByDay', () => {
  it('returns no days for no stops', () => {
    expect(groupStopsByDay([], '2026-12-20')).toEqual([])
  })

  it('groups stops by date and keeps their order', () => {
    const days = groupStopsByDay(
      [stop(1, '2026-12-20'), stop(2, '2026-12-20'), stop(3, '2026-12-22')],
      '2026-12-20',
    )

    expect(days).toHaveLength(2)
    expect(days[0].dayNumber).toBe(1)
    expect(days[0].stops.map((s) => s.id)).toEqual([1, 2])
    expect(days[1].dayNumber).toBe(3)
    expect(days[1].stops.map((s) => s.id)).toEqual([3])
  })

  it('numbers days from the start of the trip, not from the first stop', () => {
    const days = groupStopsByDay([stop(1, '2026-12-22')], '2026-12-20')

    expect(days[0].dayNumber).toBe(3)
  })
})
