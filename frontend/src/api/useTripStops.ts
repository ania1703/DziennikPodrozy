import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface StopPhoto {
  id: number
  url: string
  caption: string | null
  sortOrder: number
}

export interface StopWeather {
  weatherCode: number
  temperatureMax: number
  temperatureMin: number
  precipitationMm: number
}

export interface StopRecording {
  id: number
  url: string
  durationSeconds: number
  createdAt: string
}

export interface TripStop {
  id: number
  title: string
  latitude: number
  longitude: number
  date: string
  sortOrder: number
  note: string | null
  photos: StopPhoto[]
  weather: StopWeather | null
  recordings: StopRecording[]
}

export function useTripStops(tripId: number) {
  return useQuery({
    queryKey: ['trips', String(tripId), 'stops'],
    queryFn: async () => {
      const response = await axiosClient.get<TripStop[]>(`/trips/${tripId}/stops`)
      return response.data
    },
  })
}