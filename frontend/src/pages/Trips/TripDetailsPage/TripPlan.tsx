import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import type { PlaceResult } from '../../../api/usePlaceSearch'
import { useTripStops, type TripStop } from '../../../api/useTripStops'
import type { Trip } from '../../../api/useTrips'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { groupStopsByDay } from '../../../utils/groupStopsByDay'
import AddStopDialog from './AddStopDialog'
import DayBox from './DayBox'
import MapAddControls from './MapAddControls'
import DeleteStopDialog from './DeleteStopDialog'
import EditStopDialog from './EditStopDialog'
import {
  PlanDays,
  PlanLayout,
  PlanMapColumn,
  TripPlanSection,
} from './TripDetailsPage.styles'
import TripMap, { type MapPosition } from './TripMap'
import MapLegend from './MapLegend'

interface TripPlanProps {
  trip: Trip
}

interface StopDraft {
  position: MapPosition
  title: string
  fromSearch: boolean
}

function TripPlan({ trip }: TripPlanProps) {
  const { data: stops, isLoading, isError } = useTripStops(trip.id)
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null)
  const [addingStop, setAddingStop] = useState(false)
  const [draft, setDraft] = useState<StopDraft | null>(null)
  const [editingStop, setEditingStop] = useState<TripStop | null>(null)
  const [deletingStop, setDeletingStop] = useState<TripStop | null>(null)

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
    setDraft({ position, title: '', fromSearch: false })
    setAddingStop(false)
  }

  function handleSelectPlace(place: PlaceResult) {
    setDraft({
      position: { latitude: place.latitude, longitude: place.longitude },
      title: place.name,
      fromSearch: true,
    })
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
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        Plan podróży
      </Typography>

      <PlanLayout>
        <PlanMapColumn>
          <TripMap
            stops={stops}
            selectedStopId={selectedStopId}
            onSelectStop={handleSelectFromMap}
            addingStop={addingStop}
            pendingPosition={draft?.position ?? null}
            focusPosition={draft?.fromSearch ? draft.position : null}
            onPickPosition={handlePickPosition}
            tripStartDate={trip.startDate}
          />

          <MapLegend days={days} />

          <MapAddControls
            adding={addingStop}
            onStart={() => setAddingStop(true)}
            onCancel={() => setAddingStop(false)}
            onSelectPlace={handleSelectPlace}
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
                onEditStop={setEditingStop}
                onDeleteStop={setDeletingStop}
                tripId={trip.id}
              />
            ))
          )}
        </PlanDays>
      </PlanLayout>

      {draft && (
        <AddStopDialog
          trip={trip}
          position={draft.position}
          initialTitle={draft.title}
          defaultDate={defaultDate}
          onClose={() => setDraft(null)}
        />
      )}

      {editingStop && (
        <EditStopDialog trip={trip} stop={editingStop} onClose={() => setEditingStop(null)} />
      )}

      {deletingStop && (
        <DeleteStopDialog trip={trip} stop={deletingStop} onClose={() => setDeletingStop(null)} />
      )}
      
    </TripPlanSection>
  )
}

export default TripPlan