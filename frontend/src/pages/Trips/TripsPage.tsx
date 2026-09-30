import Typography from '@mui/material/Typography'
import TripsList from './TripsList'

function TripsPage() {
  return (
    <div>
      <Typography variant="h4" component="h1" sx={{ padding: '24px 24px 0' }}>
        Moje podróże
      </Typography>
      <TripsList />
    </div>
  )
}

export default TripsPage