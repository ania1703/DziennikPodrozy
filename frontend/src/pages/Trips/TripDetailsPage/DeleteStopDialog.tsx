import { useDeleteTripStop } from '../../../api/useDeleteTripStop'
import type { TripStop } from '../../../api/useTripStops'
import type { Trip } from '../../../api/useTrips'
import { ConfirmDeleteDialog } from '../../../components/common/ConfirmDeleteDialog'

interface DeleteStopDialogProps {
  trip: Trip
  stop: TripStop
  onClose: () => void
}

function DeleteStopDialog({ trip, stop, onClose }: DeleteStopDialogProps) {
  const deleteStop = useDeleteTripStop(trip.id, stop.id)

  return (
    <ConfirmDeleteDialog
      open
      title="Usunąć przystanek?"
      description={`Przystanek „${stop.title}” zostanie usunięty. Tej operacji nie można cofnąć.`}
      isPending={deleteStop.isPending}
      isError={deleteStop.isError}
      onConfirm={() => deleteStop.mutate(undefined, { onSuccess: onClose })}
      onClose={onClose}
    />
  )
}

export default DeleteStopDialog