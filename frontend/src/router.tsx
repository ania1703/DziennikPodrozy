import { createBrowserRouter } from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
])