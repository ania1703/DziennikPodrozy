import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Trip } from './useTrips'

export function useTrip(id: string | undefined) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: async () => {
      const response = await axiosClient.get<Trip>(`/trips/${id}`)
      return response.data
    },
    enabled: id !== undefined,
  })
}