import { createContext } from 'react'

export interface AuthContextValue {
  token: string | null
  userName: string | null
  roles: string[]
  login: (token: string, userName: string, roles: string[]) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)