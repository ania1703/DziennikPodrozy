import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useChangeTripStatus } from '../../../api/useChangeTripStatus'
import type { Trip } from '../../../api/useTrips'

interface TripStatusControlProps {
  trip: Trip
}

function TripStatusControl({ trip }: TripStatusControlProps) {
  const changeStatus = useChangeTripStatus(trip.id)

  return (
    <>
      {changeStatus.isError && (
        <Alert severity="error">Nie udało się zmienić statusu.</Alert>
      )}

      {trip.status === 'Planned' ? (
        <>
          <Button
            variant="contained"
            disabled={changeStatus.isPending}
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
      )}
    </>
  )
}

export default TripStatusControl