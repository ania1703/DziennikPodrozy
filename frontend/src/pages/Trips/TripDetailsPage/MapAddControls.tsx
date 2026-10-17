import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { PlaceResult } from '../../../api/usePlaceSearch'
import PlaceSearch from './PlaceSearch'
import { MapOverlay, MapSearchCard, MapSearchFooter } from './TripDetailsPage.styles'

interface MapAddControlsProps {
  adding: boolean
  onStart: () => void
  onCancel: () => void
  onSelectPlace: (place: PlaceResult) => void
}

function MapAddControls({ adding, onStart, onCancel, onSelectPlace }: MapAddControlsProps) {
  return (
    <MapOverlay>
      {adding ? (
        <MapSearchCard>
          <PlaceSearch onSelect={onSelectPlace} />

          <MapSearchFooter>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Wybierz wynik albo kliknij punkt na mapie.
            </Typography>

            <Button size="small" onClick={onCancel}>
              Anuluj
            </Button>
          </MapSearchFooter>
        </MapSearchCard>
      ) : (
        <Button variant="contained" onClick={onStart}>
          Dodaj przystanek
        </Button>
      )}
    </MapOverlay>
  )
}

export default MapAddControls