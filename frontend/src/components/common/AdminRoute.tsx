import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

export function AdminRoute() {
  const { roles } = useAuth()

  if (!roles.includes('Admin')) {
    return <Navigate to="/trips" replace />
  }

  return <Outlet />
}