import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import { invalidateTrip } from './invalidateTrip'

export function useDeleteStopPhoto(tripId: number, stopId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (photoId: number) => {
      await axiosClient.delete(`/trips/${tripId}/stops/${stopId}/photos/${photoId}`)
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}