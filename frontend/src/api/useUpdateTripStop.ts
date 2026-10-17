import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { TripStop } from './useTripStops'

export interface UpdateTripStopPayload {
  title: string
  latitude: number
  longitude: number
  date: string
  note: string | null
}

export function useUpdateTripStop(tripId: number, stopId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateTripStopPayload) => {
      const response = await axiosClient.put<TripStop>(
        `/trips/${tripId}/stops/${stopId}`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', String(tripId), 'stops'] })
    },
  })
}