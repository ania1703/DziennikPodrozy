import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Profile } from './useProfile'

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosClient.post<Profile>('/profile/avatar', formData)
      return response.data
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
    },
  })
}