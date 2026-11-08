import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export type AdminUserAction = 'suspend' | 'unsuspend' | 'request-deletion' | 'delete'

export function useAdminUserAction(action: AdminUserAction) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      if (action === 'delete') {
        await axiosClient.delete(`/admin/users/${userId}`)
      } else {
        await axiosClient.post(`/admin/users/${userId}/${action}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}