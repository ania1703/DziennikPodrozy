import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { useTripStops } from '../../../api/useTripStops'
import type { Trip } from '../../../api/useTrips'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { groupStopsByDay } from '../../../utils/groupStopsByDay'
import DayBox from './DayBox'
import { TripPlanSection } from './TripDetailsPage.styles'
import TripMap from './TripMap'

interface TripPlanProps {
  trip: Trip
}

function TripPlan({ trip }: TripPlanProps) {
  const { data: stops, isLoading, isError } = useTripStops(trip.id)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !stops) {
    return <Alert severity="error">Nie udało się pobrać planu podróży.</Alert>
  }

  const days = groupStopsByDay(stops, trip.startDate)
  const firstNumbers = days.map(
    (_, index) =>
      days.slice(0, index).reduce((sum, day) => sum + day.stops.length, 0) + 1,
  )

  return (
    <TripPlanSection>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Plan podróży
      </Typography>

        <TripMap stops={stops} />

      {days.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>
          Nie dodano jeszcze żadnych przystanków.
        </Typography>
      ) : (
        days.map((day, index) => (
          <DayBox key={day.date} day={day} firstNumber={firstNumbers[index]} />
        ))
      )}
    </TripPlanSection>
  )
}

export default TripPlan