import { useState } from 'react'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSaveNextTimeNote } from '../../../api/useSaveNextTimeNote'
import type { Trip } from '../../../api/useTrips'
import { NextTimeBox } from './TripDetailsPage.styles'

interface NextTimeEditorProps {
  trip: Trip
  onClose: () => void
}

function NextTimeEditor({ trip, onClose }: NextTimeEditorProps) {
  const saveNote = useSaveNextTimeNote(trip.id)
  const [text, setText] = useState(trip.nextTimeNote ?? '')

  return (
    <>
      {saveNote.isError && (
        <Alert severity="error" sx={{ alignSelf: 'stretch' }}>
          Nie udało się zapisać notatki.
        </Alert>
      )}

      <TextField
        label="Co zrobić inaczej następnym razem? Co polecasz?"
        value={text}
        onChange={(event) => setText(event.target.value)}
        multiline
        minRows={3}
        fullWidth
        autoFocus
        slotProps={{ htmlInput: { maxLength: 2000 } }}
        helperText={`${text.length}/2000`}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          variant="contained"
          size="small"
          disabled={saveNote.isPending}
          onClick={() => saveNote.mutate(text, { onSuccess: onClose })}
        >
          {saveNote.isPending ? 'Zapisywanie...' : 'Zapisz'}
        </Button>

        <Button size="small" onClick={onClose}>
          Anuluj
        </Button>
      </div>
    </>
  )
}

interface NextTimeNoteProps {
  trip: Trip
}

function NextTimeNote({ trip }: NextTimeNoteProps) {
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600, marginBottom: 2 }}>
        Na następny raz
      </Typography>

      <NextTimeBox>
        {editing ? (
          <NextTimeEditor trip={trip} onClose={() => setEditing(false)} />
        ) : (
          <>
            {trip.nextTimeNote ? (
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{trip.nextTimeNote}</Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Co zrobić inaczej? Co polecasz? Zapisz coś dla siebie na przyszłość.
              </Typography>
            )}

            <Button
              size="small"
              startIcon={<EditNoteOutlinedIcon />}
              onClick={() => setEditing(true)}
            >
              {trip.nextTimeNote ? 'Edytuj' : 'Dodaj notatkę'}
            </Button>
          </>
        )}
      </NextTimeBox>
    </div>
  )
}

export default NextTimeNote