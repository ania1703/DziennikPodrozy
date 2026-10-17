import { useCreateTripStop } from '../../../api/useCreateTripStop'
import type { Trip } from '../../../api/useTrips'
import StopFormDialog from './StopFormDialog'
import type { MapPosition } from './TripMap'

interface AddStopDialogProps {
  trip: Trip
  position: MapPosition
  initialTitle: string
  defaultDate: string
  onClose: () => void
}

function AddStopDialog({ trip, position, initialTitle, defaultDate, onClose }: AddStopDialogProps) {
  const createStop = useCreateTripStop(trip.id)

  return (
    <StopFormDialog
      trip={trip}
      position={position}
      dialogTitle="Nowy przystanek"
      submitLabel="Dodaj przystanek"
      initialValues={{ title: initialTitle, date: defaultDate, note: null }}
      isPending={createStop.isPending}
      isError={createStop.isError}
      onSubmit={(values) =>
        createStop.mutate(
          { ...values, latitude: position.latitude, longitude: position.longitude },
          { onSuccess: onClose },
        )
      }
      onClose={onClose}
    />
  )
}

export default AddStopDialog