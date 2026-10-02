import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Trip } from './useTrips'

export interface CreateTripPayLoad {
  title: string
  description: string | null
  startDate: string
  endDate: string | null
}

export function useCreateTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTripPayLoad) => {
      const response = await axiosClient.post<Trip>('/trips', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
