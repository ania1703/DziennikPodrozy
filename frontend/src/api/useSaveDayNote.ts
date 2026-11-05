import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'

interface SaveDayNotePayload {
  date: string
  text: string
}

export function useSaveDayNote(tripId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ date, text }: SaveDayNotePayload) => {
      await axiosClient.put(`/trips/${tripId}/day-notes/${date}`, { text })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', String(tripId), 'day-notes'] })
    },
  })
}