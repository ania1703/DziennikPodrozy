import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface DayNote {
  date: string
  text: string
}

export function useDayNotes(tripId: number) {
  return useQuery({
    queryKey: ['trips', String(tripId), 'day-notes'],
    queryFn: async () => {
      const response = await axiosClient.get<DayNote[]>(`/trips/${tripId}/day-notes`)
      return response.data
    },
  })
}

export function toDayNoteMap(notes: DayNote[] | undefined): Map<string, string> {
  return new Map((notes ?? []).map((note) => [note.date, note.text]))
}