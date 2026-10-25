import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Profile } from './useProfile'

export interface UpdateProfilePayload {
  bio: string | null
  homeCity: string | null
  homeLatitude: number | null
  homeLongitude: number | null
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await axiosClient.put<Profile>('/profile', payload)
      return response.data
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
    },
  })
}