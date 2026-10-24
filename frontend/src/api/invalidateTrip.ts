import type { QueryClient } from '@tanstack/react-query'

export function invalidateTrip(queryClient: QueryClient, tripId: number) {
  queryClient.invalidateQueries({ queryKey: ['trips', String(tripId)] })
  queryClient.invalidateQueries({ queryKey: ['trips'], exact: true })
}