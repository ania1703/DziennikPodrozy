import { useEffect } from 'react'
import { divIcon, latLngBounds } from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useTheme } from '@mui/material/styles'
import type { TripStop } from '../../../api/useTripStops'
import { MapFrame } from './TripDetailsPage.styles'

const DEFAULT_CENTER: [number, number] = [52.0, 19.0]

const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-85, -180],
  [85, 180],
]

function createStopIcon(number: number, selected: boolean) {
  const size = selected ? 42 : 32

  return divIcon({
    className: selected ? 'stop-marker stop-marker--active' : 'stop-marker',
    html: String(number),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
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

interface TripMapProps {
  stops: TripStop[]
  selectedStopId: number | null
  onSelectStop: (stopId: number) => void
}

function TripMap({ stops, selectedStopId, onSelectStop }: TripMapProps) {
  const theme = useTheme()
  const positions = stops.map((stop): [number, number] => [stop.latitude, stop.longitude])
  const selectedStop = stops.find((stop) => stop.id === selectedStopId)

  return (
    <MapFrame>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={5}
        minZoom={2}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          noWrap
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToStops stops={stops} />
        <FlyToSelected stop={selectedStop} />

        <Polyline
          positions={positions}
          pathOptions={{
            color: theme.palette.primary.main,
            weight: 3,
            opacity: 0.8,
            dashArray: '8 8',
          }}
        />

        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={createStopIcon(index + 1, stop.id === selectedStopId)}
            zIndexOffset={stop.id === selectedStopId ? 1000 : 0}
            eventHandlers={{ click: () => onSelectStop(stop.id) }}
          >
            <Tooltip direction="top" offset={[0, -16]}>
              {stop.title}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </MapFrame>
  )
}

export default TripMap