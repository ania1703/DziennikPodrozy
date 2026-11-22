import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDayColor } from '../src/utils/dayColors'
import { daysSince, formatDay, formatLastActive } from '../src/utils/formatActivity'
import { formatDuration, formatRecordedAt } from '../src/utils/formatRecording'
import { toHtml } from '../src/utils/richText'
import { normalizeForSearch } from '../src/utils/searchText'
import { getTripFallbackColor } from '../src/utils/tripColors'
import { formatTemperature, getWeatherInfo } from '../src/utils/weather'

describe('normalizeForSearch', () => {
  it('lowercases text', () => {
    expect(normalizeForSearch('Wypad DO Krakowa')).toBe('wypad do krakowa')
  })

  it('removes Polish diacritics, including the letter ł', () => {
    expect(normalizeForSearch('Kraków')).toBe('krakow')
    expect(normalizeForSearch('Łódź')).toBe('lodz')
    expect(normalizeForSearch('Zażółć gęślą jaźń')).toBe('zazolc gesla jazn')
  })

  it('keeps digits and spaces', () => {
    expect(normalizeForSearch('Lato 2026')).toBe('lato 2026')
  })

  it('returns an empty text for an empty value', () => {
    expect(normalizeForSearch('')).toBe('')
  })

  it('lets a query without diacritics find a title with them', () => {
    expect(normalizeForSearch('Wypad do Krakowa').includes(normalizeForSearch('krak'))).toBe(true)
    expect(normalizeForSearch('Mediolan').includes(normalizeForSearch('Kraków'))).toBe(false)
  })
})

describe('getDayColor', () => {
  it('starts with the brown of the app', () => {
    expect(getDayColor(1)).toBe('hsl(18, 43%, 35%)')
  })

  it('gives different colors to the first twenty days', () => {
    const colors = Array.from({ length: 20 }, (_, i) => getDayColor(i + 1))

    expect(new Set(colors).size).toBe(20)
  })

  it('keeps the hue within 0-359 for any day number', () => {
    for (const day of [-30, -1, 0, 1, 2, 7, 50, 365, 1000]) {
      const hue = Number(/hsl\((\d+),/.exec(getDayColor(day))![1])

      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }
  })

  it('uses the same saturation and lightness for every day', () => {
    for (const day of [1, 5, 30]) {
      expect(getDayColor(day)).toMatch(/, 43%, 35%\)$/)
    }
  })
})

describe('getTripFallbackColor', () => {
  it('cycles through four colors', () => {
    expect(getTripFallbackColor(0)).toBe(getTripFallbackColor(4))
    expect(new Set([0, 1, 2, 3].map(getTripFallbackColor)).size).toBe(4)
  })
})

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [65, '1:05'],
    [300, '5:00'],
    [600, '10:00'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })
})

describe('formatRecordedAt', () => {
  it('treats server times without a zone as UTC', () => {
    expect(formatRecordedAt('2026-10-24T22:03:00')).toBe(formatRecordedAt('2026-10-24T22:03:00Z'))
  })

  it('includes the year', () => {
    expect(formatRecordedAt('2026-10-24T12:00:00Z')).toContain('2026')
  })
})

describe('toHtml', () => {
  it('wraps plain text lines in paragraphs', () => {
    expect(toHtml('Pierwsza\nDruga')).toBe('<p>Pierwsza</p><p>Druga</p>')
  })

  it('escapes special characters in plain text', () => {
    expect(toHtml('5 < 6 & 7 > 3')).toBe('<p>5 &lt; 6 &amp; 7 &gt; 3</p>')
  })

  it('leaves existing HTML untouched', () => {
    expect(toHtml('<p>Cześć <strong>świecie</strong></p>')).toBe('<p>Cześć <strong>świecie</strong></p>')
  })
})

describe('weather', () => {
  it.each([
    [0, 'Bezchmurnie'],
    [1, 'Głównie słonecznie'],
    [2, 'Częściowe zachmurzenie'],
    [3, 'Pochmurno'],
    [45, 'Mgła'],
    [53, 'Mżawka'],
    [63, 'Deszcz'],
    [73, 'Śnieg'],
    [81, 'Przelotny deszcz'],
    [85, 'Przelotny śnieg'],
    [95, 'Burza'],
    [99, 'Burza'],
    [30, 'Pogoda'],
  ])('describes weather code %i as "%s"', (code, label) => {
    expect(getWeatherInfo(code).label).toBe(label)
  })

  it('rounds temperatures to whole degrees', () => {
    expect(formatTemperature(12.4)).toBe('12°')
    expect(formatTemperature(12.6)).toBe('13°')
    expect(formatTemperature(-3.2)).toBe('-3°')
  })
})

describe('activity formatting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-22T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const ago = (milliseconds: number) => new Date(Date.now() - milliseconds).toISOString()
  const minutes = (n: number) => n * 60_000
  const hours = (n: number) => n * 3_600_000
  const days = (n: number) => n * 86_400_000

  it('says there is no activity when there is no date', () => {
    expect(formatLastActive(null)).toBe('Brak')
  })

  it('describes recent activity', () => {
    expect(formatLastActive(ago(minutes(2)))).toBe('Przed chwilą')
    expect(formatLastActive(ago(minutes(30)))).toBe('30 min temu')
    expect(formatLastActive(ago(hours(3)))).toBe('3 godz. temu')
  })

  it('says "yesterday" for the previous day', () => {
    expect(formatLastActive(ago(hours(30)))).toBe('Wczoraj')
  })

  it('counts days for the last month', () => {
    expect(formatLastActive(ago(days(5)))).toBe('5 dni temu')
    expect(formatLastActive(ago(days(29)))).toBe('29 dni temu')
  })

  it('shows a date after a month', () => {
    const value = ago(days(40))

    expect(formatLastActive(value)).toBe(new Date(value).toLocaleDateString('pl-PL'))
  })

  it('treats server times without a zone as UTC', () => {
    expect(formatLastActive('2026-11-22T11:00:00')).toBe('1 godz. temu')
  })

  it('formats a day in the Polish style', () => {
    expect(formatDay('2026-11-05T12:00:00Z')).toBe(new Date('2026-11-05T12:00:00Z').toLocaleDateString('pl-PL'))
  })

  it('counts days since a moment, and gives a negative number for the future', () => {
    expect(daysSince('2026-11-20T12:00:00Z')).toBeCloseTo(2, 6)
    expect(daysSince('2026-11-25T12:00:00Z')).toBeCloseTo(-3, 6)
  })
})
