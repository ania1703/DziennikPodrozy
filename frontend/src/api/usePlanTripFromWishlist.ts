import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Trip } from './useTrips'
import type { WishlistItem } from './useWishlist'

interface PlanTripPayload {
  item: WishlistItem
  title: string
  startDate: string
  endDate: string | null
  removeFromList: boolean
}

export function usePlanTripFromWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ item, title, startDate, endDate, removeFromList }: PlanTripPayload) => {
      const tripResponse = await axiosClient.post<Trip>('/trips', {
        title,
        description: item.note ? item.note.slice(0, 300) : null,
        startDate,
        endDate,
        status: 'Planned',
      })

      const trip = tripResponse.data

      try {
        await axiosClient.post(`/trips/${trip.id}/stops`, {
          title: item.title,
          latitude: item.latitude,
          longitude: item.longitude,
          date: startDate,
          note: null,
        })
      } catch (error) {
        await axiosClient.delete(`/trips/${trip.id}`)
        throw error
      }

      if (removeFromList) {
        await axiosClient.delete(`/wishlist/${item.id}`).catch(() => undefined)
      }

      return trip
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}