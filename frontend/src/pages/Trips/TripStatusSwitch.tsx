import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import { useChangeTripStatus } from '../../api/useChangeTripStatus'
import type { Trip } from '../../api/useTrips'

interface TripStatusSwitchProps {
  trip: Trip
}

function TripStatusSwitch({ trip }: TripStatusSwitchProps) {
  const changeStatus = useChangeTripStatus(trip.id)

  return (
    <>
      {changeStatus.isError && (
        <Alert severity="error">Nie udało się zmienić statusu.</Alert>
      )}

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
    </>
  )
}

export default TripStatusSwitch