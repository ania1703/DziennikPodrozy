import { useQuery } from '@tanstack/react-query'
import axiosClient from './axiosClient'

export interface Trip {
  id: number
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  status: string
  coverPhotoUrl: string | null
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