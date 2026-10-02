import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { Trip } from '../../../api/useTrips'
import { TripStatusChip } from '../../../components/common/TripStatusChip'
import TripStatusSwitch from './TripStatusSwitch'
import DeleteTripAction from './DeleteTripAction'
import {
  TripDetailsContainer,
  TripDetailsContent,
  TripDetailsCover,
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
          {trip.startDate}
          {trip.endDate ? ` – ${trip.endDate}` : ''}
        </Typography>

        <TripStatusChip status={trip.status} />

        <TripStatusSwitch trip={trip} />

        <DeleteTripAction trip={trip} />

        <Typography>{trip.description ?? 'Brak opisu.'}</Typography>
      </TripDetailsContent>
    </TripDetailsContainer>
  )
}

export default TripDetails