import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { TripStop } from './useTripStops'
import { invalidateTrip } from './invalidateTrip'

export interface CreateTripStopPayload {
  title: string
  latitude: number
  longitude: number
  date: string
  note: string | null
}

export function useCreateTripStop(tripId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTripStopPayload) => {
      const response = await axiosClient.post<TripStop>(`/trips/${tripId}/stops`, payload)
      return response.data
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}