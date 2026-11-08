import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

export function RootRedirect() {
  const { token, roles } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={roles.includes('Admin') ? '/admin' : '/trips'} replace />
}