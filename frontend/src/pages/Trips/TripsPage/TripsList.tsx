import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTrips } from '../../../api/useTrips'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import TripCard from './TripCard'
import TripStatusFilter, { type TripFilter } from './TripStatusFilter'
import { EmptyState, TripsGrid } from './TripsPage.styles'

function TripsList() {
  const { data: trips, isLoading, isError } = useTrips()
  const [filter, setFilter] = useState<TripFilter>('All')

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

  const counts: Record<TripFilter, number> = {
    All: trips.length,
    InProgress: trips.filter((trip) => trip.status === 'InProgress').length,
    Planned: trips.filter((trip) => trip.status === 'Planned').length,
    Finished: trips.filter((trip) => trip.status === 'Finished').length,
  }

  const visibleTrips =
    filter === 'All' ? trips : trips.filter((trip) => trip.status === filter)

  return (
    <>
      <TripStatusFilter value={filter} counts={counts} onChange={setFilter} />

      <TripsGrid>
        {visibleTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </TripsGrid>
    </>
  )
}

export default TripsList