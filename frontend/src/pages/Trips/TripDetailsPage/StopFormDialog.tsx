import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Trip } from '../../../api/useTrips'
import { StopFormFields } from './TripDetailsPage.styles'
import type { MapPosition } from './TripMap'

export interface StopFormValues {
  title: string
  date: string
  note: string | null
}

interface StopFormDialogProps {
  trip: Trip
  position: MapPosition
  dialogTitle: string
  submitLabel: string
  initialValues: StopFormValues
  isPending: boolean
  isError: boolean
  onSubmit: (values: StopFormValues) => void
  onClose: () => void
}

function StopFormDialog({
  trip,
  position,
  dialogTitle,
  submitLabel,
  initialValues,
  isPending,
  isError,
  onSubmit,
  onClose,
}: StopFormDialogProps) {
  const [title, setTitle] = useState(initialValues.title)
  const [date, setDate] = useState(initialValues.date)
  const [note, setNote] = useState(initialValues.note ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    onSubmit({ title, date, note: note || null })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{dialogTitle}</DialogTitle>

        <DialogContent>
          <StopFormFields>
            {isError && (
              <Alert severity="error">
                Nie udało się zapisać przystanku. Sprawdź, czy data mieści się w datach podróży.
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

          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Zapisywanie...' : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default StopFormDialog