import { describe, expect, it } from 'vitest'
import { formatTripSummary } from '../src/utils/formatTripSummary'

const none = { dayCount: null, stopCount: 0, photoCount: 0, recordingCount: 0 }

describe('formatTripSummary', () => {
  it('returns an empty text when there is nothing to show', () => {
    expect(formatTripSummary(none)).toBe('')
  })

  it('joins all parts with a middle dot', () => {
    const summary = formatTripSummary({ dayCount: 3, stopCount: 5, photoCount: 12, recordingCount: 1 })

    expect(summary).toBe('3 dni · 5 miejsc · 12 zdjęć · 1 nagranie')
  })

  it('omits the number of days when the trip has no end date', () => {
    expect(formatTripSummary({ ...none, stopCount: 2 })).toBe('2 miejsca')
  })

  it('omits parts that are zero', () => {
    expect(formatTripSummary({ ...none, dayCount: 2, photoCount: 4 })).toBe('2 dni · 4 zdjęcia')
  })

  it.each([
    [1, '1 dzień'],
    [2, '2 dni'],
    [4, '4 dni'],
    [5, '5 dni'],
    [12, '12 dni'],
    [22, '22 dni'],
    [24, '24 dni'],
    [30, '30 dni'],
  ])('uses the right form of "dzień" for %i', (days, expected) => {
    expect(formatTripSummary({ ...none, dayCount: days })).toBe(expected)
  })

  it.each([
    [1, '1 miejsce'],
    [2, '2 miejsca'],
    [5, '5 miejsc'],
    [12, '12 miejsc'],
    [14, '14 miejsc'],
    [22, '22 miejsca'],
    [25, '25 miejsc'],
  ])('uses the right form of "miejsce" for %i', (count, expected) => {
    expect(formatTripSummary({ ...none, stopCount: count })).toBe(expected)
  })

  it.each([
    [1, '1 zdjęcie'],
    [3, '3 zdjęcia'],
    [5, '5 zdjęć'],
    [13, '13 zdjęć'],
    [23, '23 zdjęcia'],
  ])('uses the right form of "zdjęcie" for %i', (count, expected) => {
    expect(formatTripSummary({ ...none, photoCount: count })).toBe(expected)
  })

  it.each([
    [1, '1 nagranie'],
    [2, '2 nagrania'],
    [5, '5 nagrań'],
    [12, '12 nagrań'],
  ])('uses the right form of "nagranie" for %i', (count, expected) => {
    expect(formatTripSummary({ ...none, recordingCount: count })).toBe(expected)
  })
})
