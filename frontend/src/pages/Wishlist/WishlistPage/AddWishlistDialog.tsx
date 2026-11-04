import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCreateWishlistItem } from '../../../api/useCreateWishlistItem'
import type { PlaceResult } from '../../../api/usePlaceSearch'
import PlaceSearch from '../../Trips/TripDetailsPage/PlaceSearch'

interface AddWishlistDialogProps {
  onClose: () => void
}

function AddWishlistDialog({ onClose }: AddWishlistDialogProps) {
  const createItem = useCreateWishlistItem()
  const [place, setPlace] = useState<PlaceResult | null>(null)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  function handleSelect(selected: PlaceResult) {
    setPlace(selected)
    setTitle(selected.name)
  }

  function handleSubmit() {
    if (!place) {
      return
    }

    createItem.mutate(
      {
        title: title.trim(),
        latitude: place.latitude,
        longitude: place.longitude,
        note: note.trim() || null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        variant="h5"
        sx={{ fontWeight: 700, borderBottom: '1px solid #EADFCB', marginBottom: 2 }}
      >
        Dodaj miejsce
      </DialogTitle>

      <DialogContent>
        {createItem.isError && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            Nie udało się dodać miejsca. Spróbuj ponownie.
          </Alert>
        )}

        {!place ? (
          <PlaceSearch label="Szukaj miejsca (np. Kioto)" onSelect={handleSelect} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            <div>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {place.displayName}
              </Typography>

              <Button size="small" onClick={() => setPlace(null)}>
                Zmień miejsce
              </Button>
            </div>

            <TextField
              label="Nazwa"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 150 } }}
              required
            />

            <TextField
              label="Dlaczego tam chcę jechać? (opcjonalnie)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              multiline
              minRows={3}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${note.length}/1000`}
            />
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!place || title.trim() === '' || createItem.isPending}
        >
          {createItem.isPending ? 'Dodawanie...' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddWishlistDialog