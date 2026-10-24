import { useState, type ChangeEvent } from 'react'
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { TripStop } from '../../../api/useTripStops'
import { useUploadStopPhotos } from '../../../api/useUploadStopPhotos'
import { resizeImage } from '../../../utils/resizeImage'
import {
  PhotoGrid,
  PhotoSectionHeader,
  PhotoThumb,
  VisuallyHiddenInput,
} from './TripDetailsPage.styles'

interface StopPhotosProps {
  tripId: number
  stop: TripStop
}

function StopPhotos({ tripId, stop }: StopPhotosProps) {
  const [processing, setProcessing] = useState(false)
  const [resizeFailed, setResizeFailed] = useState(false)
  const uploadPhotos = useUploadStopPhotos(tripId, stop.id)
  const busy = processing || uploadPhotos.isPending

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (selected.length === 0) {
      return
    }

    setResizeFailed(false)
    setProcessing(true)

    try {
      const resized = await Promise.all(selected.map((file) => resizeImage(file)))
      uploadPhotos.mutate(resized)
    } catch {
      setResizeFailed(true)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <PhotoSectionHeader>
        <Typography variant="subtitle2">
          Zdjęcia{stop.photos.length > 0 ? ` (${stop.photos.length})` : ''}
        </Typography>

        <Button
          component="label"
          size="small"
          disabled={busy}
          startIcon={<AddPhotoAlternateOutlinedIcon />}
        >
          {busy ? 'Wgrywanie...' : 'Dodaj zdjęcia'}

          <VisuallyHiddenInput
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
          />
        </Button>
      </PhotoSectionHeader>

      {(uploadPhotos.isError || resizeFailed) && (
        <Alert severity="error" sx={{ marginBottom: 1 }}>
          Nie udało się dodać zdjęć. Wybierz pliki JPG, PNG lub WebP (maksymalnie 20 zdjęć na
          przystanek).
        </Alert>
      )}

      {stop.photos.length > 0 && (
        <PhotoGrid>
          {stop.photos.map((photo) => (
            <PhotoThumb
              key={photo.id}
              src={getFileUrl(photo.url)}
              alt={photo.caption ?? stop.title}
              loading="lazy"
            />
          ))}
        </PhotoGrid>
      )}
    </div>
  )
}

export default StopPhotos