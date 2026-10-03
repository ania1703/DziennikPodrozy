import type { ChangeEvent } from 'react'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { useUploadTripCover } from '../../../api/useUploadTripCover'
import type { Trip } from '../../../api/useTrips'
import { VisuallyHiddenInput } from './TripDetailsPage.styles'

interface UploadCoverActionProps {
  trip: Trip
}

function UploadCoverAction({ trip }: UploadCoverActionProps) {
  const uploadCover = useUploadTripCover(trip.id)
  const buttonLabel = trip.coverPhotoUrl ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      uploadCover.mutate(file)
    }

    event.target.value = ''
  }

  return (
    <div>
      <Button component="label" variant="outlined" disabled={uploadCover.isPending}>
        {uploadCover.isPending ? 'Wgrywanie...' : buttonLabel}
        <VisuallyHiddenInput
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleChange}
        />
      </Button>

      {uploadCover.isError && (
        <Alert severity="error" sx={{ marginTop: 1 }}>
          Nie udało się wgrać zdjęcia. Dozwolone są pliki JPG i PNG do 2 MB.
        </Alert>
      )}
    </div>
  )
}

export default UploadCoverAction