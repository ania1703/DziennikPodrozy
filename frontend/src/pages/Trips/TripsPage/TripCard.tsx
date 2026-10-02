import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { Trip } from '../../../api/useTrips'
import { TripStatusChip } from '../../../components/common/TripStatusChip'
import { TripCardOverlay, TripCardRoot } from './TripsPage.styles'

interface TripCardProps {
  trip: Trip
}

function TripCard({ trip }: TripCardProps) {
  const imageUrl = getFileUrl(trip.coverPhotoUrl)

  return (
    <Link to={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
      <TripCardRoot
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
      >
        <TripCardOverlay>
          <Typography variant="h6" component="h2" sx={{ color: 'common.white' }}>
            {trip.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'common.white' }}>
            {trip.startDate}
            {trip.endDate ? ` – ${trip.endDate}` : ''}
          </Typography>
          <TripStatusChip status={trip.status} />
        </TripCardOverlay>
      </TripCardRoot>
    </Link>
  )
}

export default TripCard