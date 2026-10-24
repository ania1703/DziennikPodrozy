import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { StopPhoto } from './useTripStops'
import { invalidateTrip } from './invalidateTrip'

export function useUploadStopPhotos(tripId: number, stopId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()

      for (const file of files) {
        formData.append('files', file)
      }

      const response = await axiosClient.post<StopPhoto[]>(
        `/trips/${tripId}/stops/${stopId}/photos`,
        formData,
      )

      return response.data
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}