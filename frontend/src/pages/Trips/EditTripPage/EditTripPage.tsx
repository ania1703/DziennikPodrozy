import { useParams } from 'react-router-dom'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { useTrip } from '../../../api/useTrip'
import EditTripForm from './EditTripForm'

function EditTripPage() {
  const { id } = useParams()
  const { data: trip, isLoading, isError } = useTrip(id)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !trip) {
    return <Alert severity="error">Nie znaleziono podróży.</Alert>
  }

  return (
    <div>
      <Typography variant="h4" component="h1" sx={{ padding: '24px 24px 0' }}>
        Edycja podróży
      </Typography>

      <EditTripForm trip={trip} />
    </div>
  )
}

export default EditTripPage