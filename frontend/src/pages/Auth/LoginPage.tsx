import { useState, type FormEvent } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { useLogin } from '../../api/useLogin'
import { useAuth } from '../../contexts/useAuth'
import { useNavigate } from 'react-router-dom'
import { AuthFormContainer } from '../../components/common/AuthFormContainer'
import { Link } from 'react-router-dom'
import MuiLink from '@mui/material/Link'
import { AuthLayout } from '../../components/common/AuthLayout'
import { isAxiosError } from 'axios'
import AlertTitle from '@mui/material/AlertTitle'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()
  const { login: saveAuth } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          saveAuth(data.token, data.userName, data.roles)
          navigate(data.roles.includes('Admin') ? '/admin' : '/trips', { replace: true })
        },
      },
    )
  }

  const errorBody = isAxiosError(login.error)
    ? (login.error.response?.data as
        | { message?: string; hint?: string; contactEmail?: string }
        | undefined)
    : undefined

  return (
    <AuthLayout>
      <AuthFormContainer onSubmit={handleSubmit}>
        <Typography variant="h4" component="h1">
          Logowanie
        </Typography>

        {login.isError && (
          <Alert severity="error">
            <AlertTitle>{errorBody?.message ?? 'Nie udało się zalogować.'}</AlertTitle>

            {errorBody?.hint}

            {errorBody?.contactEmail && (
              <>
                <br />
                <MuiLink href={`mailto:${errorBody.contactEmail}`}>
                  {errorBody.contactEmail}
                </MuiLink>
              </>
            )}
          </Alert>
        )}

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

        <MuiLink component={Link} to="/register">
          Nie masz konta? Zarejestruj się
        </MuiLink>
      </AuthFormContainer>
    </AuthLayout>
  )
}

export default LoginPage