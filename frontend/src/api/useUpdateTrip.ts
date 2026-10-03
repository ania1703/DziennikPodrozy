import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Trip } from './useTrips'

export interface UpdateTripPayload {
  title: string
  description: string | null
  startDate: string
  endDate: string | null
}

export function useUpdateTrip(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateTripPayload) => {
      const response = await axiosClient.put<Trip>(`/trips/${id}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}