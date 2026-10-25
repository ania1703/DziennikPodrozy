import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface Profile {
  userName: string
  email: string
  avatarUrl: string | null
  bio: string | null
  homeCity: string | null
  homeLatitude: number | null
  homeLongitude: number | null
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axiosClient.get<Profile>('/profile')
      return response.data
    },
  })
}