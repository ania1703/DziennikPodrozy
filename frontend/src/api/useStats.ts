import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface FarthestPoint {
  title: string
  tripId: number
  countryCode: string | null
  distanceKm: number
}

export interface Stats {
  tripCount: number
  dayCount: number
  stopCount: number
  photoCount: number
  recordingCount: number
  distanceKm: number
  countryCodes: string[]
  hasHome: boolean
  homeCity: string | null
  farthestPoint: FarthestPoint | null
  years: number[]
  firstDate: string | null
  lastDate: string | null
}

export interface StatsRange {
  from: string | null
  to: string | null
}

export function useStats(range?: StatsRange) {
  const from = range?.from ?? null
  const to = range?.to ?? null

  return useQuery({
    queryKey: ['stats', from ?? 'all', to ?? 'all'],
    queryFn: async () => {
      const response = await axiosClient.get<Stats>('/stats', {
        params: { from: from ?? undefined, to: to ?? undefined },
      })
      return response.data
    },
  })
}