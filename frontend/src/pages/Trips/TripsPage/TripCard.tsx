import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { Trip } from '../../../api/useTrips'
import { TripStatusChip } from '../../../components/common/TripStatusChip'
import { TripCardOverlay, TripCardRoot } from './TripsPage.styles'
import { formatDateRange } from '../../../utils/formatDate'
import { getTripFallbackColor } from '../../../utils/tripColors'
import { formatTripSummary } from '../../../utils/formatTripSummary'

interface TripCardProps {
  trip: Trip
}

function TripCard({ trip }: TripCardProps) {
  const imageUrl = getFileUrl(trip.coverPhotoUrl)

  return (
    <Link to={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
      <TripCardRoot
        style={{
          backgroundColor: getTripFallbackColor(trip.id),
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
      >
        <TripCardOverlay>
          <Typography variant="h6" component="h2" sx={{ color: 'common.white' }}>
            {trip.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'common.white' }}>
            {formatDateRange(trip.startDate, trip.endDate)}
          </Typography>
          {formatTripSummary(trip) && (
            <Typography variant="caption" sx={{ color: 'common.white', opacity: 0.85 }}>
              {formatTripSummary(trip)}
            </Typography>
          )}
          <TripStatusChip status={trip.status} />
        </TripCardOverlay>
      </TripCardRoot>
    </Link>
  )
}

export default TripCard