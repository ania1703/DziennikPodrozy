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
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axiosClient.get<Stats>('/stats')
      return response.data
    },
  })
}