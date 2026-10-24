import type { KeyboardEvent } from 'react'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import type { TripStop } from '../../../api/useTripStops'
import { htmlToText } from '../../../utils/richText'
import RichTextView from './RichTextView'
import StopPhotos from './StopPhotos'
import WeatherSummary from './WeatherSummary'
import {
  PhotoCount,
  StopActions,
  StopBoxContent,
  StopBoxRoot,
  StopNumber,
  StopPreview,
  StopTitleRow,
} from './TripDetailsPage.styles'

interface StopBoxProps {
  stop: TripStop
  tripId: number
  number: number
  selected: boolean
  color: string
  onToggle: (stopId: number) => void
  onEdit: (stop: TripStop) => void
  onDelete: (stop: TripStop) => void
}

function StopBox({
  stop,
  tripId,
  number,
  selected,
  color,
  onToggle,
  onEdit,
  onDelete,
}: StopBoxProps) {
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

      <StopBoxContent>
        <StopTitleRow>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {stop.title}
          </Typography>

          {stop.weather && <WeatherSummary weather={stop.weather} />}

        </StopTitleRow>

        {!selected && stop.note && (
          <StopPreview variant="body2">{htmlToText(stop.note)}</StopPreview>
        )}

        {!selected && stop.photos.length > 0 && (
          <PhotoCount>
            <PhotoCameraOutlinedIcon fontSize="inherit" />
            {stop.photos.length}
          </PhotoCount>
        )}

        <Collapse in={selected}>
          {stop.note ? (
            <RichTextView content={stop.note} />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Brak wpisu.
            </Typography>
          )}

          <div onClick={(event) => event.stopPropagation()}>
            <StopPhotos tripId={tripId} stop={stop} />
          </div>

          <Typography
            variant="caption"
            component="p"
            sx={{ marginTop: 1, color: 'text.secondary' }}
          >
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
      </StopBoxContent>
    </StopBoxRoot>
  )
}

export default StopBox