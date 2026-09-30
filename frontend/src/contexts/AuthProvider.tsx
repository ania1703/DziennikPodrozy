import { useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'))
  const [roles, setRoles] = useState<string[]>(
    JSON.parse(localStorage.getItem('roles') ?? '[]'),
  )

  function login(newToken: string, newUserName: string, newRoles: string[]) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('userName', newUserName)
    localStorage.setItem('roles', JSON.stringify(newRoles))
    setToken(newToken)
    setUserName(newUserName)
    setRoles(newRoles)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('roles')
    setToken(null)
    setUserName(null)
    setRoles([])
  }

  return (
    <AuthContext.Provider value={{ token, userName, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}