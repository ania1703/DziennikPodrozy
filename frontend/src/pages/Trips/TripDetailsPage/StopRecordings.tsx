import { useEffect, useMemo, useState } from 'react'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useDeleteStopRecording } from '../../../api/useDeleteStopRecording'
import { getFileUrl } from '../../../api/fileUrl'
import type { StopRecording, TripStop } from '../../../api/useTripStops'
import { useUploadStopRecording } from '../../../api/useUploadStopRecording'
import { ConfirmDeleteDialog } from '../../../components/common/ConfirmDeleteDialog'
import { useAudioRecorder } from '../../../hooks/useAudioRecorder'
import { formatDuration, formatRecordedAt } from '../../../utils/formatRecording'
import {
  PhotoSectionHeader,
  RecordingAudio,
  RecordingBar,
  RecordingDot,
  RecordingItem,
} from './TripDetailsPage.styles'

interface StopRecordingsProps {
  tripId: number
  stop: TripStop
}

function StopRecordings({ tripId, stop }: StopRecordingsProps) {
  const recorder = useAudioRecorder()
  const uploadRecording = useUploadStopRecording(tripId, stop.id)
  const deleteRecording = useDeleteStopRecording(tripId, stop.id)
  const [deletingRecording, setDeletingRecording] = useState<StopRecording | null>(null)

  const previewUrl = useMemo(
    () => (recorder.blob ? URL.createObjectURL(recorder.blob) : null),
    [recorder.blob],
  )

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    },
    [previewUrl],
  )

  function handleSave() {
    if (!recorder.blob) {
      return
    }

    uploadRecording.mutate(
      { blob: recorder.blob, durationSeconds: Math.max(1, recorder.seconds) },
      { onSuccess: () => recorder.reset() },
    )
  }

  function handleConfirmDelete() {
    if (!deletingRecording) {
      return
    }

    deleteRecording.mutate(deletingRecording.id, {
      onSuccess: () => setDeletingRecording(null),
    })
  }

  return (
    <div>
      <PhotoSectionHeader>
        <Typography variant="subtitle2">
          Nagrania{stop.recordings.length > 0 ? ` (${stop.recordings.length})` : ''}
        </Typography>

        {recorder.status === 'idle' && (
          <Button
            size="small"
            startIcon={<MicNoneOutlinedIcon />}
            onClick={() => recorder.start()}
          >
            Nagraj
          </Button>
        )}
      </PhotoSectionHeader>

      {recorder.error && (
        <Alert severity="error" sx={{ marginBottom: 1 }}>
          {recorder.error}
        </Alert>
      )}

      {uploadRecording.isError && (
        <Alert severity="error" sx={{ marginBottom: 1 }}>
          Nie udało się zapisać nagrania. Spróbuj ponownie.
        </Alert>
      )}

      {recorder.status === 'recording' && (
        <RecordingBar>
          <RecordingDot />

          <Typography variant="body2">
            Nagrywanie... {formatDuration(recorder.seconds)} / 5:00
          </Typography>

          <Button
            size="small"
            startIcon={<StopCircleOutlinedIcon />}
            onClick={() => recorder.stop()}
          >
            Zatrzymaj
          </Button>

          <Button size="small" onClick={() => recorder.reset()}>
            Anuluj
          </Button>
        </RecordingBar>
      )}

      {recorder.status === 'recorded' && previewUrl && (
        <RecordingBar>
          <RecordingAudio controls src={previewUrl} />

          <Button
            size="small"
            variant="contained"
            disabled={uploadRecording.isPending}
            onClick={handleSave}
          >
            {uploadRecording.isPending ? 'Zapisywanie...' : 'Zapisz'}
          </Button>

          <Button
            size="small"
            disabled={uploadRecording.isPending}
            onClick={() => recorder.reset()}
          >
            Odrzuć
          </Button>
        </RecordingBar>
      )}

      {stop.recordings.map((recording) => (
        <RecordingItem key={recording.id}>
          <RecordingAudio controls preload="metadata" src={getFileUrl(recording.url)} />

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatDuration(recording.durationSeconds)} ·{' '}
            {formatRecordedAt(recording.createdAt)}
          </Typography>

          <IconButton
            size="small"
            aria-label="Usuń nagranie"
            sx={{ color: 'text.secondary' }}
            onClick={() => setDeletingRecording(recording)}
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </RecordingItem>
      ))}

      <ConfirmDeleteDialog
        open={deletingRecording !== null}
        title="Usunąć nagranie?"
        description="Nagranie zostanie trwale usunięte. Tej operacji nie można cofnąć."
        isPending={deleteRecording.isPending}
        isError={deleteRecording.isError}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingRecording(null)}
      />
    </div>
  )
}

export default StopRecordings