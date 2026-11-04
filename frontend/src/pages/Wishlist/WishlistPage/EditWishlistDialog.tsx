import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useUpdateWishlistItem } from '../../../api/useUpdateWishlistItem'
import type { WishlistItem } from '../../../api/useWishlist'

interface EditWishlistDialogProps {
  item: WishlistItem
  onClose: () => void
}

function EditWishlistDialog({ item, onClose }: EditWishlistDialogProps) {
  const updateItem = useUpdateWishlistItem(item.id)
  const [title, setTitle] = useState(item.title)
  const [note, setNote] = useState(item.note ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    updateItem.mutate(
      { title: title.trim(), note: note.trim() || null },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle
          variant="h5"
          sx={{ fontWeight: 700, borderBottom: '1px solid #EADFCB', marginBottom: 2 }}
        >
          Edytuj miejsce
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {updateItem.isError && (
            <Alert severity="error">Nie udało się zapisać zmian. Spróbuj ponownie.</Alert>
          )}

          <TextField
            label="Nazwa"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 150 } }}
            required
            sx={{ marginTop: 1 }}
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
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Anuluj</Button>

          <Button
            type="submit"
            variant="contained"
            disabled={title.trim() === '' || updateItem.isPending}
          >
            {updateItem.isPending ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditWishlistDialog