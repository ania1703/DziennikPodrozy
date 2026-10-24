import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import { invalidateTrip } from './invalidateTrip'

export function useDeleteTripStop(tripId: number, stopId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await axiosClient.delete(`/trips/${tripId}/stops/${stopId}`)
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}