import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface ConfirmActionDialogProps {
  title: string
  description: string
  confirmLabel: string
  destructive: boolean
  isPending: boolean
  errorMessage: string | null
  onConfirm: () => void
  onClose: () => void
}

function ConfirmActionDialog({
  title,
  description,
  confirmLabel,
  destructive,
  isPending,
  errorMessage,
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <DialogContentText>{description}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>

        <Button
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? 'Zapisywanie...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmActionDialog