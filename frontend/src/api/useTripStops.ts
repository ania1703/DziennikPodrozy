import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface TripStop {
  id: number
  title: string
  latitude: number
  longitude: number
  date: string
  sortOrder: number
  note: string | null
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