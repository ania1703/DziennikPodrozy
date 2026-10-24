import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { StopRecording } from './useTripStops'
import { invalidateTrip } from './invalidateTrip'

interface UploadRecordingPayload {
  blob: Blob
  durationSeconds: number
}

function getExtension(mimeType: string): string {
  if (mimeType.includes('ogg')) return 'ogg'
  if (mimeType.includes('mp4')) return 'm4a'

  return 'webm'
}

export function useUploadStopRecording(tripId: number, stopId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ blob, durationSeconds }: UploadRecordingPayload) => {
      const formData = new FormData()
      formData.append('durationSeconds', String(durationSeconds))
      formData.append('file', blob, `nagranie.${getExtension(blob.type)}`)

      const response = await axiosClient.post<StopRecording>(
        `/trips/${tripId}/stops/${stopId}/recordings`,
        formData,
      )

      return response.data
    },
    onSuccess: () => {
      invalidateTrip(queryClient, tripId)
    },
  })
}