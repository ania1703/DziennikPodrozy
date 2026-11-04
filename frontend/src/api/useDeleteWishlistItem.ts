import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export function useDeleteWishlistItem(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await axiosClient.delete(`/wishlist/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}