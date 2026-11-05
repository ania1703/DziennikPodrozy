import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSaveDayNote } from '../../../api/useSaveDayNote'
import { DayNoteBox } from './TripDetailsPage.styles'

interface DayNoteEditorProps {
  tripId: number
  date: string
  note: string | null
  onClose: () => void
}

function DayNoteEditor({ tripId, date, note, onClose }: DayNoteEditorProps) {
  const saveNote = useSaveDayNote(tripId)
  const [text, setText] = useState(note ?? '')

  function handleSave() {
    saveNote.mutate({ date, text }, { onSuccess: onClose })
  }

  return (
    <DayNoteBox style={{ alignItems: 'stretch' }}>
      {saveNote.isError && (
        <Alert severity="error">Nie udało się zapisać podsumowania dnia.</Alert>
      )}

      <TextField
        label="Podsumowanie dnia"
        value={text}
        onChange={(event) => setText(event.target.value)}
        multiline
        minRows={2}
        autoFocus
        slotProps={{ htmlInput: { maxLength: 2000 } }}
        helperText={`${text.length}/2000`}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={saveNote.isPending}
        >
          {saveNote.isPending ? 'Zapisywanie...' : 'Zapisz'}
        </Button>

        <Button size="small" onClick={onClose}>
          Anuluj
        </Button>
      </div>
    </DayNoteBox>
  )
}

interface DayNoteProps {
  tripId: number
  date: string
  note: string | null
  editing: boolean
  onClose: () => void
}

function DayNote({ tripId, date, note, editing, onClose }: DayNoteProps) {
  if (editing) {
    return <DayNoteEditor tripId={tripId} date={date} note={note} onClose={onClose} />
  }

  if (note) {
    return (
      <DayNoteBox>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{note}</Typography>
      </DayNoteBox>
    )
  }

  return null
}

export default DayNote