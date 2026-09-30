import { useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  userName: string
  email: string
  roles: string[]
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await axiosClient.post<LoginResponse>('/auth/login', payload)
      return response.data
    },
  })
}