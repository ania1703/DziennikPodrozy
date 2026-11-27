export function validateUserName(value: string): string | null {
  if (value.trim() === '') {
    return 'Podaj login.'
  }

  if (value.length < 3) {
    return 'Login musi mieć co najmniej 3 znaki.'
  }

  if (!/^[a-zA-Z0-9\-._@+]+$/.test(value)) {
    return 'Login może zawierać litery bez polskich znaków, cyfry oraz - . _ @ + (bez spacji).'
  }

  return null
}

export function validateEmail(value: string): string | null {
  if (value.trim() === '') {
    return 'Podaj adres e-mail.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Adres e-mail jest nieprawidłowy (przykład: jan@poczta.pl).'
  }

  return null
}

export const PASSWORD_RULES = [
  { label: 'co najmniej 8 znaków', test: (value: string) => value.length >= 8 },
  { label: 'wielka litera', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'mała litera', test: (value: string) => /[a-z]/.test(value) },
  { label: 'cyfra', test: (value: string) => /\d/.test(value) },
]

export function validatePassword(value: string): string | null {
  return PASSWORD_RULES.every((rule) => rule.test(value))
    ? null
    : 'Hasło nie spełnia wszystkich wymagań poniżej.'
}