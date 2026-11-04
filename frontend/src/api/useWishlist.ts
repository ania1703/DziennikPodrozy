import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface WishlistItem {
  id: number
  title: string
  latitude: number
  longitude: number
  countryCode: string | null
  note: string | null
  addedOn: string
}

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await axiosClient.get<WishlistItem[]>('/wishlist')
      return response.data
    },
  })
}