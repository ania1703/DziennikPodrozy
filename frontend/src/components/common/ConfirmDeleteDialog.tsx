import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  description: string
  isPending: boolean
  isError: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  isPending,
  isError,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {isError && <Alert severity="error">Nie udało się usunąć.</Alert>}

        <DialogContentText>{description}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>

        <Button color="error" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Usuwanie...' : 'Usuń'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}