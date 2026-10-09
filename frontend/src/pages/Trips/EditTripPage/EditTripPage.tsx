import { useParams } from 'react-router-dom'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import Alert from '@mui/material/Alert'
import { useTrip } from '../../../api/useTrip'
import { FormPageLayout } from '../../../components/common/FormPageLayout'
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
      <FormPageLayout
        title="Edycja podróży"
        backTo={`/trips/${trip.id}`}
        backLabel="← Wróć do podróży"
        >
       <EditTripForm trip={trip} />
      </FormPageLayout>
  )
}

export default EditTripPage