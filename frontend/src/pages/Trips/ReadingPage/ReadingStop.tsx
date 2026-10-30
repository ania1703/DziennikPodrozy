import { useState } from 'react'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { TripStop } from '../../../api/useTripStops'
import { formatDuration, formatRecordedAt } from '../../../utils/formatRecording'
import { htmlToText } from '../../../utils/richText'
import PhotoLightbox from '../TripDetailsPage/PhotoLightbox'
import RichTextView from '../TripDetailsPage/RichTextView'
import {
  RecordingAudio,
  RecordingItem,
  StopNumber,
} from '../TripDetailsPage/TripDetailsPage.styles'
import WeatherSummary from '../TripDetailsPage/WeatherSummary'
import {
  ReadingNote,
  ReadingPhoto,
  ReadingPhotoGrid,
  ReadingRecordings,
  ReadingStopHeading,
  ReadingStopRoot,
  ReadingStopTitle,
} from './ReadingPage.styles'

interface ReadingStopProps {
  stop: TripStop
  number: number
  color: string
}

function ReadingStop({ stop, number, color }: ReadingStopProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const hasNote = stop.note !== null && htmlToText(stop.note).trim() !== ''

  return (
    <ReadingStopRoot>
      <ReadingStopTitle>
        <ReadingStopHeading>
          <StopNumber style={{ backgroundColor: color }}>{number}</StopNumber>

          <Typography variant="h5" component="h3">
            {stop.title}
          </Typography>
        </ReadingStopHeading>

        {stop.weather && <WeatherSummary weather={stop.weather} />}
      </ReadingStopTitle>

      {hasNote && stop.note && (
        <ReadingNote>
          <RichTextView content={stop.note} />
        </ReadingNote>
      )}

      {stop.photos.length > 0 && (
        <ReadingPhotoGrid>
          {stop.photos.map((photo, index) => (
            <ReadingPhoto
              key={photo.id}
              src={getFileUrl(photo.url)}
              alt={photo.caption ?? stop.title}
              loading="lazy"
              onClick={() => setViewerIndex(index)}
            />
          ))}
        </ReadingPhotoGrid>
      )}

      {stop.recordings.length > 0 && (
        <ReadingRecordings>
          {stop.recordings.map((recording) => (
            <RecordingItem key={recording.id}>
              <RecordingAudio controls preload="metadata" src={getFileUrl(recording.url)} />

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatDuration(recording.durationSeconds)} ·{' '}
                {formatRecordedAt(recording.createdAt)}
              </Typography>
            </RecordingItem>
          ))}
        </ReadingRecordings>
      )}

      {viewerIndex !== null && stop.photos[viewerIndex] && (
        <PhotoLightbox
          photos={stop.photos}
          index={viewerIndex}
          title={stop.title}
          onIndexChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </ReadingStopRoot>
  )
}

export default ReadingStop