import { useMutation } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export type ExportFormat = 'txt' | 'json' | 'zip'

export function useExportTrip(tripId: number, title: string) {
  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const response = await axiosClient.get<Blob>(`/trips/${tripId}/export`, {
        params: { format },
        responseType: 'blob',
      })

      const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'podroz'
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')

      link.href = url
      link.download = `${safeTitle} - dane podróży.${format}`
      link.click()

      URL.revokeObjectURL(url)
    },
  })
}