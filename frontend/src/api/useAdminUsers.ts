import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface AdminUser {
  id: string
  userName: string
  email: string
  avatarUrl: string | null
  createdAt: string
  lastActiveAt: string | null
  isSuspended: boolean
  deletionRequestedAt: string | null
  deletionAllowedAt: string | null
  isAdmin: boolean
  tripCount: number
  stopCount: number
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await axiosClient.get<AdminUser[]>('/admin/users')
      return response.data
    },
  })
}