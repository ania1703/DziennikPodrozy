import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { getFileUrl } from '../../api/fileUrl'
import type { Trip } from '../../api/useTrips'
import { TripCardOverlay, TripCardRoot } from './TripsPage.styles'

interface TripCardProps {
  trip: Trip
}

function TripCard({ trip }: TripCardProps) {
    const statusLabel = trip.status === 'Finished' ? 'Zakończona' : 'W trakcie'
    const imageUrl = getFileUrl(trip.coverPhotoUrl)

    return (
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
                <Chip
                    label={statusLabel}
                    color={trip.status === 'Finished' ? 'success' : 'warning'}
                    size="small"
                />
            </TripCardOverlay>
        </TripCardRoot>
    )
}

export default TripCard
