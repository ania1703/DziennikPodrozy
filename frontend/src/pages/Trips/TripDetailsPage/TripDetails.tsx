import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import { getFileUrl } from '../../../api/fileUrl'
import type { Trip } from '../../../api/useTrips'
import { TripStatusChip } from '../../../components/common/TripStatusChip'
import { formatDateRange } from '../../../utils/formatDate'
import { formatTripSummary } from '../../../utils/formatTripSummary'
import { getTripFallbackColor } from '../../../utils/tripColors'
import DeleteTripAction from './DeleteTripAction'
import UploadCoverAction from './UploadCoverAction'
import NextTimeNote from './NextTimeNote'
import { DescribedChip } from '../../../components/common/DescribedChip'
import TripStatusMenu from './TripStatusMenu'
import TripPlan from './TripPlan'
import {
  TripDetailsActions,
  TripDetailsCard,
  TripDetailsContainer,
  TripDetailsContent,
  TripDetailsCover,
  TripDetailsStatus,
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

      <TripDetailsCard>
        <TripDetailsCover
          style={{
            backgroundColor: getTripFallbackColor(trip.id),
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          }}
        />

        <TripDetailsContent>
          <Typography variant="h4" component="h1">
            {trip.title}
          </Typography>

          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            {formatDateRange(trip.startDate, trip.endDate)}
          </Typography>

          <TripDetailsStatus>
            <TripStatusChip status={trip.status} size="medium" />
            {trip.isDescribed && <DescribedChip size="medium" />}
            <TripStatusMenu trip={trip} />
          </TripDetailsStatus>

          {trip.description && (
            <Typography
              sx={{
                fontStyle: 'italic',
                whiteSpace: 'pre-wrap',
                maxWidth: '70ch',
                color: 'text.secondary',
              }}
            >
              „{trip.description}”
            </Typography>
          )}

          {formatTripSummary(trip) && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {formatTripSummary(trip)}
            </Typography>
          )}

          <TripPlan trip={trip} />
          <NextTimeNote trip={trip} />

          <Divider />

          <TripDetailsActions>
            <Button
              variant="contained"
              component={Link}
              to={`/trips/${trip.id}/read`}
              startIcon={<AutoStoriesOutlinedIcon />}
            >
              Czytaj dziennik
            </Button>

            <UploadCoverAction trip={trip} />

            <Button variant="outlined" component={Link} to={`/trips/${trip.id}/edit`}>
              Edytuj podróż
            </Button>

            <DeleteTripAction trip={trip} />
          </TripDetailsActions>
        </TripDetailsContent>
      </TripDetailsCard>
    </TripDetailsContainer>
  )
}

export default TripDetails