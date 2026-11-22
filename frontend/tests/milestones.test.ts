import { describe, expect, it } from 'vitest'
import type { Stats } from '../src/api/useStats'
import { getMilestones } from '../src/utils/milestones'

function makeStats(overrides: Partial<Stats> = {}): Stats {
  return {
    tripCount: 0,
    dayCount: 0,
    stopCount: 0,
    photoCount: 0,
    recordingCount: 0,
    distanceKm: 0,
    countryCodes: [],
    hasHome: false,
    homeCity: null,
    farthestPoint: null,
    years: [],
    firstDate: null,
    lastDate: null,
    ...overrides,
  }
}

function find(stats: Stats, id: string) {
  const milestone = getMilestones(stats).find((item) => item.id === id)

  if (!milestone) {
    throw new Error(`Brak osiągnięcia ${id}`)
  }

  return milestone
}

describe('getMilestones', () => {
  it('has unique ids and a title and description for every milestone', () => {
    const milestones = getMilestones(makeStats())

    expect(new Set(milestones.map((m) => m.id)).size).toBe(milestones.length)
    expect(milestones.length).toBe(22)
    expect(milestones.every((m) => m.title.length > 0 && m.description.length > 0)).toBe(true)
  })

  it('has nothing achieved for a user without trips', () => {
    expect(getMilestones(makeStats()).some((m) => m.achieved)).toBe(false)
  })

  it('achieves the first trip after one trip, and gives it no progress bar', () => {
    const milestone = find(makeStats({ tripCount: 1 }), 'trips-1')

    expect(milestone.achieved).toBe(true)
    expect(milestone.ratio).toBe(1)
    expect(milestone.progressLabel).toBeNull()
  })

  it('shows how far the user is from the next goal', () => {
    const milestone = find(makeStats({ tripCount: 1 }), 'trips-5')

    expect(milestone.achieved).toBe(false)
    expect(milestone.ratio).toBeCloseTo(0.2, 6)
    expect(milestone.progressLabel).toBe('1 z 5 podróży')
  })

  it('achieves a goal exactly at the target', () => {
    expect(find(makeStats({ tripCount: 5 }), 'trips-5').achieved).toBe(true)
    expect(find(makeStats({ tripCount: 4 }), 'trips-5').achieved).toBe(false)
  })

  it('never lets the ratio exceed 1', () => {
    expect(find(makeStats({ tripCount: 50 }), 'trips-5').ratio).toBe(1)
  })

  it('counts countries', () => {
    const stats = makeStats({ countryCodes: ['PL', 'IT', 'GR'] })

    expect(find(stats, 'countries-3').achieved).toBe(true)
    expect(find(stats, 'countries-10').progressLabel).toBe('3 z 10 krajów')
  })

  it('measures the share of Europe in percent', () => {
    const three = makeStats({ countryCodes: ['PL', 'IT', 'GR'] })
    const seven = makeStats({ countryCodes: ['PL', 'IT', 'GR', 'DE', 'FR', 'ES', 'PT'] })

    expect(find(three, 'europe-10').achieved).toBe(false)
    expect(find(three, 'europe-10').progressLabel).toBe('6,5% z 10%')
    expect(find(seven, 'europe-10').achieved).toBe(true)
  })

  it('counts continents', () => {
    const stats = makeStats({ countryCodes: ['PL', 'JP'] })

    expect(find(stats, 'continents-2').achieved).toBe(true)
    expect(find(stats, 'continents-3').achieved).toBe(false)
    expect(find(stats, 'continents-3').progressLabel).toBe('2 z 3 kontynentów')
  })

  it('counts distance and formats large numbers the Polish way', () => {
    const stats = makeStats({ distanceKm: 41 })

    expect(find(stats, 'distance-1000').progressLabel).toBe('41 z 1000 km')
    expect(find(stats, 'distance-10000').progressLabel).toMatch(/^41 z 10\s000 km$/)
    expect(find(makeStats({ distanceKm: 40075 }), 'distance-40075').achieved).toBe(true)
  })

  it('counts days, photos and recordings', () => {
    const stats = makeStats({ dayCount: 30, photoCount: 99, recordingCount: 1 })

    expect(find(stats, 'days-30').achieved).toBe(true)
    expect(find(stats, 'days-100').achieved).toBe(false)
    expect(find(stats, 'photos-100').achieved).toBe(false)
    expect(find(stats, 'photos-100').progressLabel).toBe('99 z 100 zdjęć')
    expect(find(stats, 'recordings-1').achieved).toBe(true)
  })

  it('uses the farthest point from home, and zero when it is unknown', () => {
    const far = makeStats({
      farthestPoint: { title: 'Rodos', tripId: 4, countryCode: 'GR', distanceKm: 1922 },
    })

    expect(find(far, 'farthest-1000').achieved).toBe(true)
    expect(find(far, 'farthest-5000').achieved).toBe(false)
    expect(find(far, 'farthest-5000').ratio).toBeCloseTo(1922 / 5000, 6)
    expect(find(makeStats(), 'farthest-1000').achieved).toBe(false)
  })
})
