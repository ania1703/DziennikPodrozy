import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTripStops } from '../../../api/useTripStops'
import type { Trip } from '../../../api/useTrips'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { groupStopsByDay } from '../../../utils/groupStopsByDay'
import AddStopDialog from './AddStopDialog'
import DayBox from './DayBox'
import {
  PlanDays,
  PlanLayout,
  PlanMapColumn,
  TripPlanHeader,
  TripPlanSection,
} from './TripDetailsPage.styles'
import TripMap, { type MapPosition } from './TripMap'

interface TripPlanProps {
  trip: Trip
}

function TripPlan({ trip }: TripPlanProps) {
  const { data: stops, isLoading, isError } = useTripStops(trip.id)
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)
  const [addingStop, setAddingStop] = useState(false)
  const [newStopPosition, setNewStopPosition] = useState<MapPosition | null>(null)

  function handleToggleStop(stopId: number) {
    setSelectedStopId((current) => (current === stopId ? null : stopId))
  }

  function handleSelectFromMap(stopId: number) {
    setSelectedStopId(stopId)

    document
      .getElementById(`stop-${stopId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handlePickPosition(position: MapPosition) {
    setNewStopPosition(position)
    setAddingStop(false)
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
  const selectedStop = stops.find((stop) => stop.id === selectedStopId)
  const defaultDate = selectedStop?.date ?? stops[stops.length - 1]?.date ?? trip.startDate

  return (
    <TripPlanSection>
      <TripPlanHeader>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Plan podróży
        </Typography>

        <Button
          variant={addingStop ? 'outlined' : 'contained'}
          onClick={() => setAddingStop((current) => !current)}
        >
          {addingStop ? 'Anuluj dodawanie' : 'Dodaj przystanek'}
        </Button>
      </TripPlanHeader>

      {addingStop && (
        <Alert severity="info">
          Kliknij na mapie miejsce, które chcesz dodać jako przystanek.
        </Alert>
      )}

      <PlanLayout>
        <PlanMapColumn>
          <TripMap
            stops={stops}
            selectedStopId={selectedStopId}
            onSelectStop={handleSelectFromMap}
            addingStop={addingStop}
            pendingPosition={newStopPosition}
            onPickPosition={handlePickPosition}
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

      {newStopPosition && (
        <AddStopDialog
          trip={trip}
          position={newStopPosition}
          defaultDate={defaultDate}
          onClose={() => setNewStopPosition(null)}
        />
      )}
    </TripPlanSection>
  )
}

export default TripPlan