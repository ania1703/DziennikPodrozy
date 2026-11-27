import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MuiLink from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getErrorMessage } from '../../api/getErrorMessage'
import { useRegister } from '../../api/useRegister'
import { AuthFormContainer } from '../../components/common/AuthFormContainer'
import { AuthLayout } from '../../components/common/AuthLayout'
import {
  PASSWORD_RULES,
  validateEmail,
  validatePassword,
  validateUserName,
} from '../../utils/registerValidation'

type Field = 'userName' | 'email' | 'password'

function getServerFieldErrors(error: unknown): Partial<Record<Field, string>> {
  if (!isAxiosError(error)) {
    return {}
  }

  const errors = error.response?.data?.errors as Record<string, string[]> | undefined
  const result: Partial<Record<Field, string>> = {}

  for (const [key, messages] of Object.entries(errors ?? {})) {
    const field = key.charAt(0).toLowerCase() + key.slice(1)

    if (field === 'userName' || field === 'email' || field === 'password') {
      result[field] = messages.join(' ')
    }
  }

  return result
}

function RegisterPage() {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const register = useRegister()

  const serverErrors = getServerFieldErrors(register.error)
  const hasServerFieldErrors = Object.keys(serverErrors).length > 0

  function fieldError(field: Field, problem: string | null): string | undefined {
    if (serverErrors[field]) {
      return serverErrors[field]
    }

    return (submitted || touched[field]) && problem ? problem : undefined
  }

  const userNameError = fieldError('userName', validateUserName(userName))
  const emailError = fieldError('email', validateEmail(email))
  const passwordError = fieldError('password', validatePassword(password))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)

    if (validateUserName(userName) || validateEmail(email) || validatePassword(password)) {
      return
    }

    register.mutate({ userName, email, password })
  }

  function handleChange(setValue: (value: string) => void, value: string) {
    register.reset()
    setValue(value)
  }

  return (
    <AuthLayout>
      <AuthFormContainer onSubmit={handleSubmit} noValidate>
        <Typography variant="h4" component="h1">
          Rejestracja
        </Typography>

        {register.isError && !hasServerFieldErrors && (
          <Alert severity="error">
            {getErrorMessage(register.error, 'Rejestracja się nie powiodła. Spróbuj ponownie.')}
          </Alert>
        )}

        {register.isSuccess && <Alert severity="success">{register.data.message}</Alert>}

        <TextField
          label="Login"
          value={userName}
          onChange={(event) => handleChange(setUserName, event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, userName: true }))}
          error={Boolean(userNameError)}
          helperText={userNameError}
          required
        />

        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => handleChange(setEmail, event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          error={Boolean(emailError)}
          helperText={emailError}
          required
        />

        <TextField
          label="Hasło"
          type="password"
          value={password}
          onChange={(event) => handleChange(setPassword, event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          error={Boolean(passwordError)}
          helperText={passwordError}
          required
        />

        <div>
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(password)

            return (
              <Typography
                key={rule.label}
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: met ? 'success.main' : 'text.secondary',
                }}
              >
                {met ? (
                  <CheckCircleIcon fontSize="inherit" />
                ) : (
                  <RadioButtonUncheckedIcon fontSize="inherit" />
                )}
                {rule.label}
              </Typography>
            )
          })}
        </div>

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