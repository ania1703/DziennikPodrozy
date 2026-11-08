import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export type TripStatus = 'Planned' | 'InProgress' | 'Finished'

export interface Trip {
  id: number
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  status: TripStatus
  coverPhotoUrl: string | null
  dayCount: number | null
  stopCount: number
  photoCount: number
  recordingCount: number
  nextTimeNote: string | null
  isDescribed: boolean
}

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const response = await axiosClient.get<Trip[]>('/trips')
      return response.data
    },
  })
}