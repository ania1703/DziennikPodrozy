import { Link } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { Trip } from '../../../api/useTrips'
import { useTripStops } from '../../../api/useTripStops'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { getDayColor } from '../../../utils/dayColors'
import { formatDateRange } from '../../../utils/formatDate'
import { formatTripSummary } from '../../../utils/formatTripSummary'
import { groupStopsByDay } from '../../../utils/groupStopsByDay'
import { getTripFallbackColor } from '../../../utils/tripColors'
import ReadingStop from './ReadingStop'
import {
  ReadingContainer,
  ReadingCover,
  ReadingDayHeader,
  ReadingDayNote,
  ReadingDaySection,
  ReadingHeader,
} from './ReadingPage.styles'
import { toDayNoteMap, useDayNotes } from '../../../api/useDayNotes'

interface ReadingViewProps {
  trip: Trip
}

function ReadingView({ trip }: ReadingViewProps) {
  const { data: stops, isLoading, isError } = useTripStops(trip.id)
  const { data: dayNotes } = useDayNotes(trip.id)
  const noteByDate = toDayNoteMap(dayNotes)
  const imageUrl = getFileUrl(trip.coverPhotoUrl)
  const summary = formatTripSummary(trip)
  const days = stops ? groupStopsByDay(stops, trip.startDate) : []

  return (
    <ReadingContainer>
      <Button component={Link} to={`/trips/${trip.id}`}>
        ← Wróć do podróży
      </Button>

      <ReadingCover
        style={{
          backgroundColor: getTripFallbackColor(trip.id),
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
      />

      <ReadingHeader>
        <Typography variant="h3" component="h1">
          {trip.title}
        </Typography>

        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Typography>

        {trip.description && (
          <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            „{trip.description}”
          </Typography>
        )}

        {summary && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {summary}
          </Typography>
        )}
      </ReadingHeader>

      {isLoading && <LoadingSpinner />}

      {isError && <Alert severity="error">Nie udało się wczytać przystanków.</Alert>}

      {stops && stops.length === 0 && (
        <Typography sx={{ marginTop: 6, textAlign: 'center', color: 'text.secondary' }}>
          W tej podróży nie ma jeszcze przystanków. Dodaj je na stronie podróży.
        </Typography>
      )}

      {days.map((day, dayIndex) => {
        const color = getDayColor(day.dayNumber)
        const firstNumber =
          days.slice(0, dayIndex).reduce((sum, previous) => sum + previous.stops.length, 0) + 1

        return (
          <ReadingDaySection key={day.date}>
            <ReadingDayHeader>
              <Typography variant="h5" component="h2">
                Dzień {day.dayNumber}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ marginLeft: 1.5, color: 'text.secondary' }}
                >
                  {formatDateRange(day.date, null)}
                </Typography>
              </Typography>
            </ReadingDayHeader>

            {noteByDate.get(day.date) && (
              <ReadingDayNote>{noteByDate.get(day.date)}</ReadingDayNote>
            )}

            {day.stops.map((stop, index) => (
              <ReadingStop
                key={stop.id}
                stop={stop}
                number={firstNumber + index}
                color={color}
              />
            ))}
          </ReadingDaySection>
        )
      })}
    </ReadingContainer>
  )
}

export default ReadingView