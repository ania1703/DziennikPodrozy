import { useState, type FormEvent } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Trip } from '../../../api/useTrips'
import RichTextEditor from './RichTextEditor'
import {
  EntryPlaceholder,
  StopFormColumn,
  StopFormGrid,
  StopFormSectionTitle,
} from './TripDetailsPage.styles'
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
  const [showEditor, setShowEditor] = useState(Boolean(initialValues.note))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    onSubmit({ title, date, note: note || null })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg">
      <form onSubmit={handleSubmit}>
        <DialogTitle
          variant="h5"
          sx={{ fontWeight: 700, borderBottom: '1px solid #EADFCB', marginBottom: 2 }}
        >
          {dialogTitle}
        </DialogTitle>

        <DialogContent>
          {isError && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              Nie udało się zapisać przystanku. Sprawdź, czy data mieści się w datach podróży
              i czy wpis nie jest zbyt długi.
            </Alert>
          )}

          <StopFormGrid>
            <StopFormColumn>
              <StopFormSectionTitle variant="h6">Miejsce</StopFormSectionTitle>

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

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Położenie: {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
              </Typography>
            </StopFormColumn>

            <StopFormColumn>
              <StopFormSectionTitle variant="h6">Wpis</StopFormSectionTitle>

              {showEditor ? (
                <RichTextEditor value={note} onChange={setNote} />
              ) : (
                <EntryPlaceholder>
                  <Typography variant="body2">
                    Opisz to miejsce własnymi słowami: co się tu wydarzyło i co warto zapamiętać.
                  </Typography>

                  <Button startIcon={<AddIcon />} onClick={() => setShowEditor(true)}>
                    Dodaj wpis (opcjonalnie)
                  </Button>
                </EntryPlaceholder>
              )}
            </StopFormColumn>
          </StopFormGrid>
        </DialogContent>

        <DialogActions sx={{ padding: '16px 24px' }}>
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