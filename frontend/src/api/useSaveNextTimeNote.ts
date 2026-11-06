import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import { invalidateTrip } from './invalidateTrip'

export function useSaveNextTimeNote(tripId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (text: string) => {
      await axiosClient.put(`/trips/${tripId}/next-time-note`, { text })
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}