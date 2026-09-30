import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

export function RootRedirect() {
    const { token } = useAuth()

    return <Navigate to={token ? '/trips' : '/login'} replace />
}