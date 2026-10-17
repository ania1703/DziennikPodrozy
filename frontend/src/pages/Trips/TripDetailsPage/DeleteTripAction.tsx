import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { useDeleteTrip } from '../../../api/useDeleteTrip'
import type { Trip } from '../../../api/useTrips'
import { ConfirmDeleteDialog } from '../../../components/common/ConfirmDeleteDialog'

interface DeleteTripActionProps {
  trip: Trip
}

function DeleteTripAction({ trip }: DeleteTripActionProps) {
  const [open, setOpen] = useState(false)
  const deleteTrip = useDeleteTrip(trip.id)
  const navigate = useNavigate()

  function handleConfirm() {
    deleteTrip.mutate(undefined, { onSuccess: () => navigate('/trips') })
  }

  return (
    <>
      <Button color="error" variant="outlined" onClick={() => setOpen(true)}>
        Usuń podróż
      </Button>

      <ConfirmDeleteDialog
        open={open}
        title="Usunąć podróż?"
        description={`Podróż „${trip.title}” zostanie usunięta razem ze wszystkimi przystankami. Tej operacji nie można cofnąć.`}
        isPending={deleteTrip.isPending}
        isError={deleteTrip.isError}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default DeleteTripAction