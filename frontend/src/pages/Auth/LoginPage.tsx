import { useState, type FormEvent } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { useLogin } from '../../api/useLogin'
import { useAuth } from '../../contexts/useAuth'
import { LoginFormContainer } from './LoginPage.styles'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()
  const { login: saveAuth } = useAuth()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          saveAuth(data.token, data.userName, data.roles)
        },
      },
    )
  }

  return (
    <LoginFormContainer onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1">
        Logowanie
      </Typography>

      {login.isError && <Alert severity="error">Nieprawidłowy e-mail lub hasło.</Alert>}

      {login.isSuccess && <Alert severity="success">Zalogowano jako {login.data.userName}</Alert>}

      <TextField
        label="E-mail"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <TextField
        label="Hasło"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <Button type="submit" variant="contained" disabled={login.isPending}>
        {login.isPending ? 'Logowanie...' : 'Zaloguj się'}
      </Button>
    </LoginFormContainer>
  )
}

export default LoginPage