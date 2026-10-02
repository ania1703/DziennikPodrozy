import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TripsList from './TripsList'
import { TripsHeader } from './TripsPage.styles'

function TripsPage() {
  return (
    <div>
        <TripsHeader>
            <Typography variant="h4" component="h1">
                Moje podróże
            </Typography>

            <Button variant="contained" component={Link} to="/trips/new">
                Nowa podróż
            </Button>
        </TripsHeader>

      <TripsList />
    </div>
  )
}

export default TripsPage