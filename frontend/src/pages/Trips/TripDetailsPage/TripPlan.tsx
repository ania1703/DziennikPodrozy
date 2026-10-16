import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { useTripStops } from '../../../api/useTripStops'
import type { Trip } from '../../../api/useTrips'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { groupStopsByDay } from '../../../utils/groupStopsByDay'
import DayBox from './DayBox'
import { PlanDays, PlanLayout, PlanMapColumn, TripPlanSection } from './TripDetailsPage.styles'
import TripMap from './TripMap'
import { useState } from 'react'

interface TripPlanProps {
  trip: Trip
}

function TripPlan({ trip }: TripPlanProps) {
  const { data: stops, isLoading, isError } = useTripStops(trip.id)

  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)

  function handleToggleStop(stopId: number) {
    setSelectedStopId((current) => (current === stopId ? null : stopId))
  }

  function handleSelectFromMap(stopId: number) {
    setSelectedStopId(stopId)

    document
      .getElementById(`stop-${stopId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

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

      <PlanLayout>
        <PlanMapColumn>
          <TripMap
            stops={stops}
            selectedStopId={selectedStopId}
            onSelectStop={handleSelectFromMap}
          />
        </PlanMapColumn>

        <PlanDays>
          {days.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>
              Nie dodano jeszcze żadnych przystanków.
            </Typography>
          ) : (
            days.map((day, index) => (
              <DayBox
                key={day.date}
                day={day}
                firstNumber={firstNumbers[index]}
                selectedStopId={selectedStopId}
                onToggleStop={handleToggleStop}
              />
            ))
          )}
        </PlanDays>
      </PlanLayout>
    </TripPlanSection>
  )
}

export default TripPlan