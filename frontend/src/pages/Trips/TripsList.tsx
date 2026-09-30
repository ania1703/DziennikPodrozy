import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { useTrips } from '../../api/useTrips'
import TripCard from './TripCard'
import { TripsGrid } from './TripsPage.styles'

function TripsList() {
  const { data: trips, isLoading, isError } = useTrips()

  if (isLoading) {
    return <CircularProgress />
  }

  if (isError) {
    return <Alert severity="error">Nie udało się pobrać podróży.</Alert>
  }

  if (!trips || trips.length === 0) {
    return <Typography>Nie masz jeszcze żadnych podróży.</Typography>
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