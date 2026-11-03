import type { Stats } from '../api/useStats'
import { getContinentProgress, getVisitedContinents } from './countries'

export type MilestoneCategory =
  | 'trips'
  | 'countries'
  | 'europe'
  | 'continents'
  | 'distance'
  | 'days'
  | 'photos'
  | 'recordings'
  | 'farthest'

interface Metrics {
  trips: number
  countries: number
  europePercent: number
  continents: number
  distanceKm: number
  days: number
  photos: number
  recordings: number
  farthestKm: number
}

interface MilestoneDefinition {
  id: string
  category: MilestoneCategory
  title: string
  description: string
  metric: keyof Metrics
  target: number
  unit: string
}

export interface Milestone {
  id: string
  category: MilestoneCategory
  title: string
  description: string
  achieved: boolean
  ratio: number
  progressLabel: string | null
}

const DEFINITIONS: MilestoneDefinition[] = [
  { id: 'trips-1', category: 'trips', title: 'Pierwsza podróż', description: 'Odbądź swoją pierwszą podróż.', metric: 'trips', target: 1, unit: ' podróży' },
  { id: 'trips-5', category: 'trips', title: 'Pięć podróży', description: 'Odbądź 5 podróży.', metric: 'trips', target: 5, unit: ' podróży' },
  { id: 'trips-10', category: 'trips', title: 'Dziesięć podróży', description: 'Odbądź 10 podróży.', metric: 'trips', target: 10, unit: ' podróży' },

  { id: 'countries-3', category: 'countries', title: 'Trzy kraje', description: 'Odwiedź 3 kraje.', metric: 'countries', target: 3, unit: ' krajów' },
  { id: 'countries-10', category: 'countries', title: 'Dziesięć krajów', description: 'Odwiedź 10 krajów.', metric: 'countries', target: 10, unit: ' krajów' },
  { id: 'countries-25', category: 'countries', title: 'Dwadzieścia pięć krajów', description: 'Odwiedź 25 krajów.', metric: 'countries', target: 25, unit: ' krajów' },

  { id: 'europe-10', category: 'europe', title: '10% Europy', description: 'Odwiedź 10% krajów Europy.', metric: 'europePercent', target: 10, unit: '%' },
  { id: 'europe-25', category: 'europe', title: '25% Europy', description: 'Odwiedź ćwierć krajów Europy.', metric: 'europePercent', target: 25, unit: '%' },
  { id: 'europe-50', category: 'europe', title: '50% Europy', description: 'Odwiedź połowę krajów Europy.', metric: 'europePercent', target: 50, unit: '%' },

  { id: 'continents-2', category: 'continents', title: 'Dwa kontynenty', description: 'Odwiedź 2 kontynenty.', metric: 'continents', target: 2, unit: ' kontynentów' },
  { id: 'continents-3', category: 'continents', title: 'Trzy kontynenty', description: 'Odwiedź 3 kontynenty.', metric: 'continents', target: 3, unit: ' kontynentów' },
  { id: 'continents-6', category: 'continents', title: 'Cały świat', description: 'Odwiedź wszystkie 6 kontynentów.', metric: 'continents', target: 6, unit: ' kontynentów' },

  { id: 'distance-1000', category: 'distance', title: '1000 km', description: 'Przebądź 1000 km.', metric: 'distanceKm', target: 1000, unit: ' km' },
  { id: 'distance-10000', category: 'distance', title: '10 000 km', description: 'Przebądź 10 000 km.', metric: 'distanceKm', target: 10000, unit: ' km' },
  { id: 'distance-40075', category: 'distance', title: 'Dookoła świata', description: 'Przebądź 40 075 km, czyli obwód Ziemi.', metric: 'distanceKm', target: 40075, unit: ' km' },

  { id: 'days-30', category: 'days', title: 'Miesiąc w drodze', description: 'Spędź 30 dni w podróży.', metric: 'days', target: 30, unit: ' dni' },
  { id: 'days-100', category: 'days', title: 'Sto dni w drodze', description: 'Spędź 100 dni w podróży.', metric: 'days', target: 100, unit: ' dni' },
  { id: 'days-365', category: 'days', title: 'Rok w drodze', description: 'Spędź 365 dni w podróży.', metric: 'days', target: 365, unit: ' dni' },

  { id: 'photos-100', category: 'photos', title: 'Album', description: 'Dodaj 100 zdjęć.', metric: 'photos', target: 100, unit: ' zdjęć' },
  { id: 'recordings-1', category: 'recordings', title: 'Głos z podróży', description: 'Nagraj pierwszą notatkę głosową.', metric: 'recordings', target: 1, unit: ' nagrań' },

  { id: 'farthest-1000', category: 'farthest', title: 'Daleko od domu', description: 'Dotrzyj ponad 1000 km od miasta domowego.', metric: 'farthestKm', target: 1000, unit: ' km' },
  { id: 'farthest-5000', category: 'farthest', title: 'Na końcu świata', description: 'Dotrzyj ponad 5000 km od miasta domowego.', metric: 'farthestKm', target: 5000, unit: ' km' },
]

function getMetrics(stats: Stats): Metrics {
  return {
    trips: stats.tripCount,
    countries: stats.countryCodes.length,
    europePercent: getContinentProgress(stats.countryCodes, 'Europe').percent,
    continents: getVisitedContinents(stats.countryCodes).length,
    distanceKm: stats.distanceKm,
    days: stats.dayCount,
    photos: stats.photoCount,
    recordings: stats.recordingCount,
    farthestKm: stats.farthestPoint?.distanceKm ?? 0,
  }
}

function formatNumber(value: number): string {
  return value.toLocaleString('pl-PL', { maximumFractionDigits: 1 })
}

function formatProgress(current: number, definition: MilestoneDefinition): string {
  if (definition.unit === '%') {
    return `${formatNumber(current)}% z ${formatNumber(definition.target)}%`
  }

  return `${formatNumber(current)} z ${formatNumber(definition.target)}${definition.unit}`
}

export function getMilestones(stats: Stats): Milestone[] {
  const metrics = getMetrics(stats)

  return DEFINITIONS.map((definition) => {
    const current = metrics[definition.metric]
    const achieved = current >= definition.target

    return {
      id: definition.id,
      category: definition.category,
      title: definition.title,
      description: definition.description,
      achieved,
      ratio: Math.min(1, current / definition.target),
      progressLabel:
        !achieved && definition.target > 1 ? formatProgress(current, definition) : null,
    }
  })
}