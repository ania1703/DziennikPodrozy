import { useState } from 'react'
import { Link } from 'react-router-dom'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTrips, type Trip } from '../../../api/useTrips'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { normalizeForSearch } from '../../../utils/searchText'
import TripCard from './TripCard'
import TripStatusFilter, { type TripFilter } from './TripStatusFilter'
import { EmptyState, TripsGrid, TripsToolbar } from './TripsPage.styles'

function matchesFilter(trip: Trip, filter: TripFilter): boolean {
  if (filter === 'All') {
    return true
  }

  if (filter === 'ToDescribe') {
    return trip.status === 'Finished' && !trip.isDescribed
  }

  return trip.status === filter
}

function matchesQuery(trip: Trip, normalizedQuery: string): boolean {
  if (normalizedQuery === '') {
    return true
  }

  return normalizeForSearch(`${trip.title} ${trip.description ?? ''}`).includes(normalizedQuery)
}

function TripsList() {
  const { data: trips, isLoading, isError } = useTrips()
  const [filter, setFilter] = useState<TripFilter>('All')
  const [query, setQuery] = useState('')

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
    InProgress: trips.filter((trip) => matchesFilter(trip, 'InProgress')).length,
    Planned: trips.filter((trip) => matchesFilter(trip, 'Planned')).length,
    Finished: trips.filter((trip) => matchesFilter(trip, 'Finished')).length,
    ToDescribe: trips.filter((trip) => matchesFilter(trip, 'ToDescribe')).length,
  }

  const normalizedQuery = normalizeForSearch(query.trim())

  const visibleTrips = trips.filter(
    (trip) => matchesFilter(trip, filter) && matchesQuery(trip, normalizedQuery),
  )

  return (
    <>
      <TripsToolbar>
        <TripStatusFilter value={filter} counts={counts} onChange={setFilter} />

        <TextField
          size="small"
          placeholder="Szukaj podróży"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{
            width: 210,
            '& .MuiOutlinedInput-root': {
              height: 32,
              borderRadius: 999,
              fontSize: '0.875rem',
            },
            '& .MuiOutlinedInput-input': { paddingY: 0 },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Wyczyść wyszukiwanie"
                    onClick={() => setQuery('')}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
      </TripsToolbar>

      {visibleTrips.length === 0 ? (
        <EmptyState>
          <Typography variant="h6" component="p">
            Brak podróży pasujących do wyszukiwania.
          </Typography>
        </EmptyState>
      ) : (
        <TripsGrid>
          {visibleTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </TripsGrid>
      )}
    </>
  )
}

export default TripsList