import { useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import { useTrip } from '../../../api/useTrip'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import ReadingView from './ReadingView'

function ReadingPage() {
  const { id } = useParams()
  const { data: trip, isLoading, isError } = useTrip(id)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !trip) {
    return <Alert severity="error">Nie znaleziono podróży.</Alert>
  }

  return <ReadingView trip={trip} />
}

export default ReadingPage