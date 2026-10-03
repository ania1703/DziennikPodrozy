import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { Trip } from '../../../api/useTrips'
import { TripStatusChip } from '../../../components/common/TripStatusChip'
import TripStatusSwitch from './TripStatusSwitch'
import DeleteTripAction from './DeleteTripAction'
import { formatDateRange } from '../../../utils/formatDate'
import {
  TripDetailsContainer,
  TripDetailsContent,
  TripDetailsCover,
  TripDetailsActions,
} from './TripDetailsPage.styles'

interface TripDetailsProps {
  trip: Trip
}

function TripDetails({ trip }: TripDetailsProps) {
  const imageUrl = getFileUrl(trip.coverPhotoUrl)

  return (
    <TripDetailsContainer>
      <Button component={Link} to="/trips">
        ← Wróć do listy
      </Button>

      <TripDetailsCover
        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
      />

      <TripDetailsContent>
        <Typography variant="h4" component="h1">
          {trip.title}
        </Typography>

        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          {formatDateRange(trip.startDate, trip.endDate)}
        </Typography>

        <TripStatusChip status={trip.status} />

        <TripStatusSwitch trip={trip} />

        <TripDetailsActions>
          <Button variant="outlined" component={Link} to={`/trips/${trip.id}/edit`}>
            Edytuj podróż
          </Button>

          <DeleteTripAction trip={trip} />
        </TripDetailsActions>

        <Typography>{trip.description ?? 'Brak opisu.'}</Typography>
      </TripDetailsContent>
    </TripDetailsContainer>
  )
}

export default TripDetails