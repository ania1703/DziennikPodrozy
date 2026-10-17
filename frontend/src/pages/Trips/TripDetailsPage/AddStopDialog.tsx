import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCreateTripStop } from '../../../api/useCreateTripStop'
import type { Trip } from '../../../api/useTrips'
import { StopFormFields } from './TripDetailsPage.styles'
import type { MapPosition } from './TripMap'

interface AddStopDialogProps {
  trip: Trip
  position: MapPosition
  defaultDate: string
  onClose: () => void
}

function AddStopDialog({ trip, position, defaultDate, onClose }: AddStopDialogProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [note, setNote] = useState('')
  const createStop = useCreateTripStop(trip.id)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    createStop.mutate(
      {
        title,
        latitude: position.latitude,
        longitude: position.longitude,
        date,
        note: note || null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nowy przystanek</DialogTitle>

        <DialogContent>
          <StopFormFields>
            {createStop.isError && (
              <Alert severity="error">
                Nie udało się dodać przystanku. Sprawdź, czy data mieści się w datach podróży.
              </Alert>
            )}

            <TextField
              label="Nazwa miejsca"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
              required
            />

            <TextField
              label="Dzień"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: trip.startDate, max: trip.endDate ?? undefined },
              }}
              required
            />

            <TextField
              label="Notatka"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              multiline
              minRows={3}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Położenie: {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
            </Typography>
          </StopFormFields>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Anuluj</Button>

          <Button type="submit" variant="contained" disabled={createStop.isPending}>
            {createStop.isPending ? 'Zapisywanie...' : 'Dodaj przystanek'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddStopDialog