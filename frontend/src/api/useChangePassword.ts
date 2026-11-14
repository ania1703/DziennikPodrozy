import { useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      await axiosClient.post('/profile/change-password', payload)
    },
  })
}