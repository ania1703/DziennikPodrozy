import { useEffect } from 'react'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { StopPhoto } from '../../../api/useTripStops'
import { LightboxBar, LightboxImage, LightboxStage } from './TripDetailsPage.styles'

interface PhotoLightboxProps {
  photos: StopPhoto[]
  index: number
  title: string
  onIndexChange: (index: number) => void
  onClose: () => void
  onDelete: (photo: StopPhoto) => void
}

function PhotoLightbox({
  photos,
  index,
  title,
  onIndexChange,
  onClose,
  onDelete,
}: PhotoLightboxProps) {
  const photo = photos[index]
  const hasPrevious = index > 0
  const hasNext = index < photos.length - 1

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' && hasPrevious) {
        onIndexChange(index - 1)
      }

      if (event.key === 'ArrowRight' && hasNext) {
        onIndexChange(index + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, hasPrevious, hasNext, onIndexChange])

  return (
      <Dialog open onClose={onClose} fullWidth maxWidth="lg">

      <LightboxBar>
        <Typography variant="subtitle1">
          {title} · {index + 1} / {photos.length}
        </Typography>

        <div>
          <IconButton aria-label="Usuń zdjęcie" color="inherit" onClick={() => onDelete(photo)}>
            <DeleteOutlineIcon />
          </IconButton>

          <IconButton aria-label="Zamknij" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </LightboxBar>

      <LightboxStage>
        {hasPrevious && (
          <IconButton
            aria-label="Poprzednie zdjęcie"
            onClick={() => onIndexChange(index - 1)}
            sx={{ position: 'absolute', left: 8, color: 'primary.main' }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}

        <LightboxImage src={getFileUrl(photo.url)} alt={photo.caption ?? title} />

        {hasNext && (
          <IconButton
            aria-label="Następne zdjęcie"
            onClick={() => onIndexChange(index + 1)}
            sx={{ position: 'absolute', right: 8, color: 'primary.main' }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </LightboxStage>
    </Dialog>
  )
}

export default PhotoLightbox