import type { KeyboardEvent } from 'react'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import type { TripStop } from '../../../api/useTripStops'
import { StopBoxRoot, StopNumber } from './TripDetailsPage.styles'

interface StopBoxProps {
  stop: TripStop
  number: number
  selected: boolean
  onToggle: (stopId: number) => void
}

function StopBox({ stop, number, selected, onToggle }: StopBoxProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggle(stop.id)
    }
  }

  return (
    <StopBoxRoot
      id={`stop-${stop.id}`}
      role="button"
      tabIndex={0}
      aria-expanded={selected}
      data-selected={selected}
      onClick={() => onToggle(stop.id)}
      onKeyDown={handleKeyDown}
    >
      <StopNumber>{number}</StopNumber>

      <div>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {stop.title}
        </Typography>

        <Collapse in={selected}>
          <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
            {stop.note ?? 'Brak notatki.'}
          </Typography>

          <Typography variant="caption" component="p" sx={{ color: 'text.secondary' }}>
            {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
          </Typography>
        </Collapse>
      </div>
    </StopBoxRoot>
  )
}

export default StopBox