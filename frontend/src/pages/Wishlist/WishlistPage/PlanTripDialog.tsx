import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import { usePlanTripFromWishlist } from '../../../api/usePlanTripFromWishlist'
import type { WishlistItem } from '../../../api/useWishlist'

interface PlanTripDialogProps {
  item: WishlistItem
  onClose: () => void
}

function PlanTripDialog({ item, onClose }: PlanTripDialogProps) {
  const navigate = useNavigate()
  const planTrip = usePlanTripFromWishlist()
  const [title, setTitle] = useState(item.title)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [removeFromList, setRemoveFromList] = useState(true)

  const isEndBeforeStart = startDate !== '' && endDate !== '' && endDate < startDate

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    planTrip.mutate(
      { item, title: title.trim(), startDate, endDate: endDate || null, removeFromList },
      { onSuccess: (trip) => navigate(`/trips/${trip.id}`) },
    )
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle
          variant="h5"
          sx={{ fontWeight: 700, borderBottom: '1px solid #EADFCB', marginBottom: 2 }}
        >
          Zaplanuj podróż
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {planTrip.isError && (
            <Alert severity="error">Nie udało się zaplanować podróży. Spróbuj ponownie.</Alert>
          )}

          <TextField
            label="Nazwa podróży"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 150 } }}
            required
            sx={{ marginTop: 1 }}
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
            label="Data zakończenia (opcjonalnie)"
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

          <FormControlLabel
            control={
              <Checkbox
                checked={removeFromList}
                onChange={(event) => setRemoveFromList(event.target.checked)}
              />
            }
            label="Usuń to miejsce z listy po zaplanowaniu"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Anuluj</Button>

          <Button
            type="submit"
            variant="contained"
            disabled={title.trim() === '' || isEndBeforeStart || planTrip.isPending}
          >
            {planTrip.isPending ? 'Planowanie...' : 'Zaplanuj'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default PlanTripDialog