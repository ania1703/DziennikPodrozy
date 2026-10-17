import type { TripStop } from '../../../api/useTripStops'
import { useUpdateTripStop } from '../../../api/useUpdateTripStop'
import type { Trip } from '../../../api/useTrips'
import StopFormDialog from './StopFormDialog'

interface EditStopDialogProps {
  trip: Trip
  stop: TripStop
  onClose: () => void
}

function EditStopDialog({ trip, stop, onClose }: EditStopDialogProps) {
  const updateStop = useUpdateTripStop(trip.id, stop.id)

  return (
    <StopFormDialog
      trip={trip}
      position={{ latitude: stop.latitude, longitude: stop.longitude }}
      dialogTitle="Edycja przystanku"
      submitLabel="Zapisz zmiany"
      initialValues={{ title: stop.title, date: stop.date, note: stop.note }}
      isPending={updateStop.isPending}
      isError={updateStop.isError}
      onSubmit={(values) =>
        updateStop.mutate(
          { ...values, latitude: stop.latitude, longitude: stop.longitude },
          { onSuccess: onClose },
        )
      }
      onClose={onClose}
    />
  )
}

export default EditStopDialog