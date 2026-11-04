import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { WishlistItem } from './useWishlist'

export interface CreateWishlistItemPayload {
  title: string
  latitude: number
  longitude: number
  note: string | null
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateWishlistItemPayload) => {
      const response = await axiosClient.post<WishlistItem>('/wishlist', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}