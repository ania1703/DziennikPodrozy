import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export function useDeleteTrip(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await axiosClient.delete(`/trips/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'], exact: true })
    },
  })
}