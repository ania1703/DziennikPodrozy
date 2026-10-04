import { useParams } from 'react-router-dom'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import Alert from '@mui/material/Alert'
import { useTrip } from '../../../api/useTrip'
import TripDetails from './TripDetails'

function TripDetailsPage() {
  const { id } = useParams()
  const { data: trip, isLoading, isError } = useTrip(id)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !trip) {
    return <Alert severity="error">Nie znaleziono podróży.</Alert>
  }

  return <TripDetails trip={trip} />
}

export default TripDetailsPage