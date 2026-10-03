import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from './axiosClient'
import type { Trip } from './useTrips'

export function useUploadTripCover(id: number) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)

            const response = await axiosClient.post<Trip>(`/trips/${id}/cover-photo`, formData)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] })
        },
    })
}