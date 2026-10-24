import type { Trip } from '../api/useTrips'

const pluralRules = new Intl.PluralRules('pl')

interface Forms {
  one: string
  few: string
  many: string
}

const DAYS: Forms = { one: 'dzień', few: 'dni', many: 'dni' }
const STOPS: Forms = { one: 'miejsce', few: 'miejsca', many: 'miejsc' }
const PHOTOS: Forms = { one: 'zdjęcie', few: 'zdjęcia', many: 'zdjęć' }
const RECORDINGS: Forms = { one: 'nagranie', few: 'nagrania', many: 'nagrań' }

function withNoun(count: number, forms: Forms): string {
  const category = pluralRules.select(count)
  const noun = category === 'one' ? forms.one : category === 'few' ? forms.few : forms.many

  return `${count} ${noun}`
}

export function formatTripSummary(
  trip: Pick<Trip, 'dayCount' | 'stopCount' | 'photoCount' | 'recordingCount'>,
): string {
  const parts: string[] = []

  if (trip.dayCount !== null) {
    parts.push(withNoun(trip.dayCount, DAYS))
  }

  if (trip.stopCount > 0) {
    parts.push(withNoun(trip.stopCount, STOPS))
  }

  if (trip.photoCount > 0) {
    parts.push(withNoun(trip.photoCount, PHOTOS))
  }

  if (trip.recordingCount > 0) {
    parts.push(withNoun(trip.recordingCount, RECORDINGS))
  }

  return parts.join(' · ')
}