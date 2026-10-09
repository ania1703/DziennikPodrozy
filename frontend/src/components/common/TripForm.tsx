import { useState, type FormEvent } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { TripFormActions, TripFormContainer } from './TripForm.styles'
import { Link } from 'react-router-dom'

export interface TripFormValues {
  title: string
  description: string | null
  startDate: string
  endDate: string | null
}

interface TripFormProps {
  initialValues?: TripFormValues
  cancelTo: string
  onSubmit: (values: TripFormValues) => void
  isPending: boolean
  isError: boolean
}

export function TripForm({ initialValues, cancelTo, onSubmit, isPending, isError }: TripFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '')
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '')

  const isEndBeforeStart = startDate !== '' && endDate !== '' && endDate < startDate

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    onSubmit({
      title,
      description: description || null,
      startDate,
      endDate: endDate || null,
    })
  }

  return (
    <TripFormContainer onSubmit={handleSubmit}>
      {isError && <Alert severity="error">Nie udało się zapisać podróży.</Alert>}

      <TextField
        label="Tytuł"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <TextField
        label="Opis"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        multiline
        minRows={3}
      />

      <TextField
        label="Data rozpoczęcia"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        required
      />

      <TextField
        label="Data zakończenia"
        type="date"
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
        error={isEndBeforeStart}
        helperText={
          isEndBeforeStart
            ? 'Data zakończenia nie może być wcześniejsza niż rozpoczęcia.'
            : undefined
        }
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate } }}
      />

      <TripFormActions>
        <Button type="submit" variant="contained" disabled={isPending || isEndBeforeStart}>
          {isPending ? 'Zapisywanie...' : 'Zapisz podróż'}
        </Button>

        <Button component={Link} to={cancelTo}>
          Anuluj
        </Button>
      </TripFormActions>
    </TripFormContainer>
  )
}