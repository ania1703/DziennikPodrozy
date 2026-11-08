import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

export function UserRoute() {
  const { roles } = useAuth()

  if (roles.includes('Admin')) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}