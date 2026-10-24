import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import { invalidateTrip } from './invalidateTrip'

export function useDeleteStopRecording(tripId: number, stopId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recordingId: number) => {
      await axiosClient.delete(`/trips/${tripId}/stops/${stopId}/recordings/${recordingId}`)
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}