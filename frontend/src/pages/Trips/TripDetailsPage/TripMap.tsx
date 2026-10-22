import { useEffect } from 'react'
import { divIcon, latLngBounds } from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { TripStop } from '../../../api/useTripStops'
import { getDayColor } from '../../../utils/dayColors'
import { getDayNumber } from '../../../utils/groupStopsByDay'
import { MapFrame } from './TripDetailsPage.styles'

export interface MapPosition {
  latitude: number
  longitude: number
}

interface DayRoute {
  date: string
  positions: [number, number][]
}

const DEFAULT_CENTER: [number, number] = [52.0, 19.0]

const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-85, -180],
  [85, 180],
]

const PENDING_ICON = divIcon({
  className: 'stop-marker',
  html: '<div class="stop-pin stop-pin--pending">+</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function createStopIcon(number: number, selected: boolean, color: string) {
  const pinClass = selected ? 'stop-pin stop-pin--active' : 'stop-pin'

  return divIcon({
    className: 'stop-marker',
    html: `<div class="${pinClass}" style="background-color: ${color}">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

function getDayRoutes(stops: TripStop[]): DayRoute[] {
  const routes = new Map<string, [number, number][]>()

  for (const stop of stops) {
    const positions = routes.get(stop.date) ?? []
    positions.push([stop.latitude, stop.longitude])
    routes.set(stop.date, positions)
  }

  return [...routes.entries()].map(([date, positions]) => ({ date, positions }))
}

function FitToStops({ stops }: { stops: TripStop[] }) {
  const map = useMap()

  useEffect(() => {
    if (stops.length === 0) {
      return
    }

    const bounds = latLngBounds(stops.map((stop) => [stop.latitude, stop.longitude]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 })
  }, [map, stops])

  return null
}

function FlyToSelected({ stop }: { stop: TripStop | undefined }) {
  const map = useMap()

  useEffect(() => {
    if (!stop) {
      return
    }

    map.flyTo([stop.latitude, stop.longitude], Math.max(map.getZoom(), 14), {
      duration: 0.8,
    })
  }, [map, stop])

  return null
}

function FlyToPosition({ position }: { position: MapPosition | null }) {
  const map = useMap()

  useEffect(() => {
    if (!position) {
      return
    }

    map.flyTo([position.latitude, position.longitude], 15, { duration: 0.8 })
  }, [map, position])

  return null
}

function PickPosition({
  active,
  onPick,
}: {
  active: boolean
  onPick: (position: MapPosition) => void
}) {
  useMapEvents({
    click(event) {
      if (active) {
        onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng })
      }
    },
  })

  return null
}

interface TripMapProps {
  stops: TripStop[]
  tripStartDate: string
  selectedStopId: number | null
  onSelectStop: (stopId: number) => void
  addingStop: boolean
  pendingPosition: MapPosition | null
  onPickPosition: (position: MapPosition) => void
  focusPosition: MapPosition | null
}

function TripMap({
  stops,
  tripStartDate,
  selectedStopId,
  onSelectStop,
  addingStop,
  pendingPosition,
  focusPosition,
  onPickPosition,
}: TripMapProps) {
  const selectedStop = stops.find((stop) => stop.id === selectedStopId)

  function colorForDate(date: string) {
    return getDayColor(getDayNumber(date, tripStartDate))
  }

  return (
    <MapFrame data-adding={addingStop}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={5}
        minZoom={2}
        zoomControl={false}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          noWrap
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        <FitToStops stops={stops} />
        <FlyToSelected stop={selectedStop} />
        <FlyToPosition position={focusPosition} />
        <PickPosition active={addingStop} onPick={onPickPosition} />

        {getDayRoutes(stops).map((route) => (
          <Polyline
            key={route.date}
            positions={route.positions}
            pathOptions={{
              color: colorForDate(route.date),
              weight: 3,
              opacity: 0.85,
              dashArray: '8 8',
            }}
          />
        ))}

        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={createStopIcon(index + 1, stop.id === selectedStopId, colorForDate(stop.date))}
            zIndexOffset={stop.id === selectedStopId ? 1000 : 0}
            eventHandlers={{ click: () => onSelectStop(stop.id) }}
          >
            <Tooltip direction="top" offset={[0, -16]}>
              {stop.title}
            </Tooltip>
          </Marker>
        ))}

        {pendingPosition && (
          <Marker
            position={[pendingPosition.latitude, pendingPosition.longitude]}
            icon={PENDING_ICON}
            interactive={false}
          />
        )}
      </MapContainer>
    </MapFrame>
  )
}

export default TripMap