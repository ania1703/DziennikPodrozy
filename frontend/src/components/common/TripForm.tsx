import { useState, type FormEvent } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { TripFormActions, TripFormContainer } from './TripForm.styles'
import { Link } from 'react-router-dom'
import MenuItem from '@mui/material/MenuItem'
import type { TripStatus } from '../../api/useTrips'

export interface TripFormValues {
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  status?: TripStatus
}

interface TripFormProps {
  initialValues?: TripFormValues
  cancelTo: string
  withStatus?: boolean
  onSubmit: (values: TripFormValues) => void
  isPending: boolean
  isError: boolean
}

export function TripForm({ initialValues, cancelTo, withStatus, onSubmit, isPending, isError }: TripFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '')
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '')
  const [status, setStatus] = useState<TripStatus>(initialValues?.status ?? 'Planned')

  const isEndBeforeStart = startDate !== '' && endDate !== '' && endDate < startDate

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

        onSubmit({
      title,
      description: description || null,
      startDate,
      endDate: endDate || null,
      ...(withStatus ? { status } : {}),
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
        label="Motto podróży (opcjonalnie)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        multiline
        minRows={2}
        slotProps={{ htmlInput: { maxLength: 300 } }}
        helperText={`${description.length}/300`}
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

      {withStatus && (
        <TextField
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as TripStatus)}
        >
          <MenuItem value="Planned">Zaplanowana</MenuItem>
          <MenuItem value="InProgress">W trakcie</MenuItem>
          <MenuItem value="Finished">Zakończona</MenuItem>
        </TextField>
      )}

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