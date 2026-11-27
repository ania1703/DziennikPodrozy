import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { getErrorMessage } from '../../api/getErrorMessage'
import { useChangePassword } from '../../api/useChangePassword'

interface ChangePasswordDialogProps {
  onClose: () => void
}

export function ChangePasswordDialog({ onClose }: ChangePasswordDialogProps) {
  const changePassword = useChangePassword()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')

  const mismatch = repeatPassword !== '' && newPassword !== repeatPassword

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    changePassword.mutate({ currentPassword, newPassword })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Zmiana hasła</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {changePassword.isError && (
            <Alert severity="error">
              {getErrorMessage(changePassword.error, 'Nie udało się zmienić hasła.')}
            </Alert>
          )}

          {changePassword.isSuccess && (
            <Alert severity="success">Hasło zostało zmienione.</Alert>
          )}

          <TextField
            label="Obecne hasło"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            sx={{ marginTop: 1 }}
          />

          <TextField
            label="Nowe hasło"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            helperText="Min. 8 znaków, wielka i mała litera, cyfra"
            required
          />

          <TextField
            label="Powtórz nowe hasło"
            type="password"
            autoComplete="new-password"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            error={mismatch}
            helperText={mismatch ? 'Hasła nie są takie same.' : undefined}
            required
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{changePassword.isSuccess ? 'Zamknij' : 'Anuluj'}</Button>

          <Button
            type="submit"
            variant="contained"
            disabled={mismatch || changePassword.isPending || changePassword.isSuccess}
          >
            {changePassword.isPending ? 'Zapisywanie...' : 'Zmień hasło'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}