import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { WishlistItem } from './useWishlist'

export interface UpdateWishlistItemPayload {
  title: string
  note: string | null
}

export function useUpdateWishlistItem(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateWishlistItemPayload) => {
      const response = await axiosClient.put<WishlistItem>(`/wishlist/${id}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}