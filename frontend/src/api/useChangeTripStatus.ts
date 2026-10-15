import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Trip, TripStatus } from './useTrips'

export function useChangeTripStatus(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status: TripStatus) => {
      const response = await axiosClient.patch<Trip>(`/trips/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}