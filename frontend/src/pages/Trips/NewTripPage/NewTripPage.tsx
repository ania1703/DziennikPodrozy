import { useNavigate } from 'react-router-dom'
import { useCreateTrip } from '../../../api/useCreateTrip'
import { FormPageLayout } from '../../../components/common/FormPageLayout'
import { TripForm } from '../../../components/common/TripForm'

function NewTripPage() {
  const createTrip = useCreateTrip()
  const navigate = useNavigate()

  return (
    <FormPageLayout title="Nowa podróż" backTo="/trips" backLabel="← Wróć do listy">
      <TripForm
        cancelTo="/trips"
        isPending={createTrip.isPending}
        isError={createTrip.isError}
        onSubmit={(payload) =>
          createTrip.mutate(payload, { onSuccess: () => navigate('/trips') })
        }
      />
    </FormPageLayout>
  )
}

export default NewTripPage