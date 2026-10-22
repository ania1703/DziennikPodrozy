import type { KeyboardEvent } from 'react'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import type { TripStop } from '../../../api/useTripStops'
import { StopActions, StopBoxRoot, StopNumber, StopPreview } from './TripDetailsPage.styles'
import { htmlToText } from '../../../utils/richText'
import RichTextView from './RichTextView'

interface StopBoxProps {
  stop: TripStop
  number: number
  selected: boolean
  color: string
  onToggle: (stopId: number) => void
  onEdit: (stop: TripStop) => void
  onDelete: (stop: TripStop) => void
}

function StopBox({ stop, number, selected, color, onToggle, onEdit, onDelete }: StopBoxProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.target !== event.currentTarget) {
      return
    }

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
      <StopNumber style={{ backgroundColor: color }}>{number}</StopNumber>

      <div>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {stop.title}
        </Typography>

        {!selected && stop.note && (
          <StopPreview variant="body2">{htmlToText(stop.note)}</StopPreview>
        )}

        <Collapse in={selected}>
          <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
          {stop.note ? (
            <RichTextView content={stop.note} />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Brak wpisu.
            </Typography>
          )}
          </Typography>

          <Typography variant="caption" component="p" sx={{ color: 'text.secondary' }}>
            {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
          </Typography>

          <StopActions>
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(stop)
              }}
            >
              Edytuj
            </Button>

            <Button
              size="small"
              color="error"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(stop)
              }}
            >
              Usuń
            </Button>
          </StopActions>
        </Collapse>
      </div>
    </StopBoxRoot>
  )
}

export default StopBox