import { useQuery } from '@tanstack/react-query'

export interface PlaceResult {
  id: number
  name: string
  displayName: string
  latitude: number
  longitude: number
}

interface NominatimItem {
  place_id: number
  name: string
  display_name: string
  lat: string
  lon: string
}

async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    'accept-language': 'pl',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)

  if (!response.ok) {
    throw new Error('Nie udało się wyszukać miejsca.')
  }

  const items: NominatimItem[] = await response.json()

  return items.map((item) => ({
    id: item.place_id,
    name: item.name || item.display_name.split(',')[0],
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }))
}

export function usePlaceSearch(query: string) {
  return useQuery({
    queryKey: ['place-search', query],
    queryFn: () => searchPlaces(query),
    enabled: query.length >= 3,
    staleTime: Infinity,
    retry: false,
  })
}