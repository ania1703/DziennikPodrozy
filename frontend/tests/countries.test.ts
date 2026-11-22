import { describe, expect, it } from 'vitest'
import {
  CONTINENT_LABELS,
  getContinent,
  getContinentProgress,
  getCountryName,
  getVisitedContinents,
  getWorldProgress,
} from '../src/utils/countries'

describe('getCountryName', () => {
  it('returns Polish names of countries', () => {
    expect(getCountryName('PL')).toBe('Polska')
    expect(getCountryName('IT')).toBe('Włochy')
    expect(getCountryName('GR')).toBe('Grecja')
    expect(getCountryName('DE')).toBe('Niemcy')
  })

  it('falls back to the code for an invalid value', () => {
    expect(getCountryName('nie-kod!')).toBe('nie-kod!')
  })
})

describe('getContinent', () => {
  it.each([
    ['PL', 'Europe'],
    ['GR', 'Europe'],
    ['GB', 'Europe'],
    ['JP', 'Asia'],
    ['TR', 'Asia'],
    ['EG', 'Africa'],
    ['US', 'NorthAmerica'],
    ['MX', 'NorthAmerica'],
    ['BR', 'SouthAmerica'],
    ['AU', 'Oceania'],
  ])('puts %s on %s', (code, continent) => {
    expect(getContinent(code)).toBe(continent)
  })

  it('returns nothing for an unknown code', () => {
    expect(getContinent('ZZ')).toBeUndefined()
  })

  it('has a Polish label for every continent', () => {
    expect(Object.values(CONTINENT_LABELS)).toEqual(
      expect.arrayContaining(['Europa', 'Azja', 'Afryka', 'Ameryka Północna', 'Ameryka Południowa', 'Oceania']),
    )
  })
})

describe('getVisitedContinents', () => {
  it('returns each visited continent once', () => {
    expect(getVisitedContinents(['PL', 'IT', 'JP'])).toEqual(['Europe', 'Asia'])
  })

  it('ignores unknown codes', () => {
    expect(getVisitedContinents(['ZZ', 'PL'])).toEqual(['Europe'])
  })

  it('returns an empty list for no countries', () => {
    expect(getVisitedContinents([])).toEqual([])
  })
})

describe('getContinentProgress', () => {
  it('counts visited countries of the continent and the share of the whole', () => {
    const progress = getContinentProgress(['PL', 'IT', 'GR'], 'Europe')

    expect(progress.visited).toBe(3)
    expect(progress.total).toBeGreaterThan(40)
    expect(progress.percent).toBeCloseTo((3 / progress.total) * 100, 6)
  })

  it('does not count countries from other continents', () => {
    expect(getContinentProgress(['JP', 'US'], 'Europe').visited).toBe(0)
  })

  it('is zero without visited countries', () => {
    expect(getContinentProgress([], 'Asia').percent).toBe(0)
  })

  it('is one hundred percent after visiting every European country', () => {
    const everyCountry = Array.from({ length: 26 * 26 }, (_, i) =>
      String.fromCharCode(65 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26)),
    )
    const european = everyCountry.filter((code) => getContinent(code) === 'Europe')

    expect(getContinentProgress(european, 'Europe').percent).toBe(100)
  })
})

describe('getWorldProgress', () => {
  it('has a plausible total number of countries', () => {
    const { total } = getWorldProgress([])

    expect(total).toBeGreaterThan(190)
    expect(total).toBeLessThan(215)
  })

  it('counts only known countries', () => {
    expect(getWorldProgress(['PL', 'IT', 'ZZ']).visited).toBe(2)
  })

  it('computes the percentage from visited and total', () => {
    const progress = getWorldProgress(['PL', 'JP'])

    expect(progress.percent).toBeCloseTo((2 / progress.total) * 100, 6)
  })
})
