import { createBrowserRouter } from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import TripsPage from './pages/Trips/TripsPage/TripsPage'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RootRedirect } from './components/common/RootRedirect'
import { AppLayout } from './components/common/AppLayout'
import NewTripPage from './pages/Trips/NewTripPage/NewTripPage'
import TripDetailsPage from './pages/Trips/TripDetailsPage/TripDetailsPage'
import EditTripPage from './pages/Trips/EditTripPage/EditTripPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/trips',
            element: <TripsPage />,
          },
          {
            path: '/trips/new',
            element: <NewTripPage />,
          },
          {
            path: '/trips/:id',
            element: <TripDetailsPage />,
          },
          {
            path: '/trips/:id/edit',
            element: <EditTripPage />,
          }
        ],
      },
    ],
  },
])