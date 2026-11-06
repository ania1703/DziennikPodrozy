import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useChangeTripStatus } from '../../../api/useChangeTripStatus'
import type { Trip } from '../../../api/useTrips'

interface TripStatusControlProps {
  trip: Trip
}

function TripStatusControl({ trip }: TripStatusControlProps) {
  const changeStatus = useChangeTripStatus(trip.id)
  const today = new Date().toISOString().slice(0, 10)
  const endedInPast = trip.endDate !== null && trip.endDate < today

  return (
    <>
      {changeStatus.isError && (
        <Alert severity="error">Nie udało się zmienić statusu.</Alert>
      )}

      {trip.status === 'Planned' ? (
        <>
          <Button
            variant="contained"
            disabled={changeStatus.isPending || endedInPast}
            onClick={() => changeStatus.mutate('InProgress')}
          >
            Rozpocznij podróż
          </Button>

          <Button
            disabled={changeStatus.isPending}
            onClick={() => changeStatus.mutate('Finished')}
          >
            Oznacz jako zakończoną
          </Button>
        </>
      ) : (
        <>
          <FormControlLabel
            label="Podróż zakończona"
            control={
              <Switch
                checked={trip.status === 'Finished'}
                disabled={changeStatus.isPending}
                onChange={(event) =>
                  changeStatus.mutate(event.target.checked ? 'Finished' : 'InProgress')
                }
              />
            }
          />

          {trip.status === 'Finished' && endedInPast && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Data zakończenia już minęła. Żeby wznowić podróż, zmień ją w „Edytuj podróż”.
            </Typography>
          )}

          {trip.status === 'InProgress' && (
            <Button
              disabled={changeStatus.isPending}
              onClick={() => changeStatus.mutate('Planned')}
            >
              Wróć do zaplanowanej
            </Button>
          )}
        </>
      )}
    </>
  )
}

export default TripStatusControl