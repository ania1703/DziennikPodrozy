import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import { useCreateTrip } from '../../../api/useCreateTrip'
import { TripForm } from '../../../components/common/TripForm'

function NewTripPage() {
  const createTrip = useCreateTrip()
  const navigate = useNavigate()

  return (
    <div>
      <Typography variant="h4" component="h1" sx={{ padding: '24px 24px 0' }}>
        Nowa podróż
      </Typography>

      <TripForm
        isPending={createTrip.isPending}
        isError={createTrip.isError}
        onSubmit={(payload) =>
          createTrip.mutate(payload, { onSuccess: () => navigate('/trips') })
        }
      />
    </div>
  )
}

export default NewTripPage