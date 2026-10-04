import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import MuiLink from '@mui/material/Link'
import { AuthLayout } from '../../components/common/AuthLayout'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { useRegister } from '../../api/useRegister'
import { AuthFormContainer } from '../../components/common/AuthFormContainer'

function RegisterPage() {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const register = useRegister()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    register.mutate({ userName, email, password })
  }

  return (
    <AuthLayout>
    <AuthFormContainer onSubmit={handleSubmit}>
      <Typography variant="h4" component="h1">
        Rejestracja
      </Typography>

      {register.isError && (
        <Alert severity="error">Rejestracja się nie powiodła. Sprawdź dane.</Alert>
      )}

      {register.isSuccess && <Alert severity="success">{register.data.message}</Alert>}

      <TextField
        label="Login"
        value={userName}
        onChange={(event) => setUserName(event.target.value)}
        required
      />

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

      <Button type="submit" variant="contained" disabled={register.isPending}>
        {register.isPending ? 'Rejestracja...' : 'Zarejestruj się'}
      </Button>

      <MuiLink component={Link} to="/login">
          Masz już konto? Zaloguj się
      </MuiLink>
    </AuthFormContainer>
    </AuthLayout>
  )
}

export default RegisterPage