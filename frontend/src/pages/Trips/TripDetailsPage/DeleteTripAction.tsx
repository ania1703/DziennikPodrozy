import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import { useDeleteTrip } from '../../../api/useDeleteTrip'
import type { Trip } from '../../../api/useTrips'

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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Usunąć podróż?</DialogTitle>

        <DialogContent>
          {deleteTrip.isError && (
            <Alert severity="error">Nie udało się usunąć podróży.</Alert>
          )}

          <DialogContentText>
            Podróż „{trip.title}” zostanie usunięta. Tej operacji nie można cofnąć.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>

          <Button color="error" onClick={handleConfirm} disabled={deleteTrip.isPending}>
            {deleteTrip.isPending ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DeleteTripAction