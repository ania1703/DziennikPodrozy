import { Link } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTrips } from '../../../api/useTrips'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import TripCard from './TripCard'
import { EmptyState, TripsGrid } from './TripsPage.styles'

function TripsList() {
  const { data: trips, isLoading, isError } = useTrips()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return <Alert severity="error">Nie udało się pobrać podróży.</Alert>
  }

  if (!trips || trips.length === 0) {
    return (
      <EmptyState>
        <Typography variant="h6" component="p">
          Nie masz jeszcze żadnych podróży.
        </Typography>

        <Button variant="contained" component={Link} to="/trips/new">
          Dodaj pierwszą podróż
        </Button>
      </EmptyState>
    )
  }

  return (
    <TripsGrid>
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </TripsGrid>
  )
}

export default TripsList