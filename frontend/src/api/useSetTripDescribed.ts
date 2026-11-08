import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import { invalidateTrip } from './invalidateTrip'

export function useSetTripDescribed(tripId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (described: boolean) => {
      await axiosClient.put(`/trips/${tripId}/described`, { described })
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}