import { useNavigate } from 'react-router-dom'
import { useUpdateTrip } from '../../../api/useUpdateTrip'
import type { Trip } from '../../../api/useTrips'
import { TripForm } from '../../../components/common/TripForm'

interface EditTripFormProps {
  trip: Trip
}

function EditTripForm({ trip }: EditTripFormProps) {
  const updateTrip = useUpdateTrip(trip.id)
  const navigate = useNavigate()

  return (
    <TripForm
      initialValues={{
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
      }}
      isPending={updateTrip.isPending}
      isError={updateTrip.isError}
      onSubmit={(values) =>
        updateTrip.mutate(values, { onSuccess: () => navigate(`/trips/${trip.id}`) })
      }
    />
  )
}

export default EditTripForm