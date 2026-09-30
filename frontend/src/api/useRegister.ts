import { useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

interface RegisterPayload {
  userName: string
  email: string
  password: string
}

interface RegisterResponse {
  message: string
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await axiosClient.post<RegisterResponse>('/auth/register', payload)
      return response.data
    },
  })
}