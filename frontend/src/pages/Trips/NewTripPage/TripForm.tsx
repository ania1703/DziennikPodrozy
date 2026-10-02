import { useState, type FormEvent } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import type { CreateTripPayLoad } from '../../../api/useCreateTrip'
import { TripFormContainer } from './NewTripPage.styles'

interface TripFormProps {
  onSubmit: (payload: CreateTripPayLoad) => void
  isPending: boolean
  isError: boolean
}

function TripForm({ onSubmit, isPending, isError }: TripFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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
          isEndBeforeStart ? 'Data zakończenia nie może być wcześniejsza niż rozpoczęcia.' : undefined
        }
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate } }}
      />

      <Button type="submit" variant="contained" disabled={isPending || isEndBeforeStart}>
        {isPending ? 'Zapisywanie...' : 'Zapisz podróż'}
      </Button>
    </TripFormContainer>
  )
}

export default TripForm