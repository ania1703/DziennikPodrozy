import Chip from '@mui/material/Chip'

interface TripStatusChipProps {
  status: string
}

export function TripStatusChip({ status }: TripStatusChipProps) {
  const isFinished = status === 'Finished'

  return (
    <Chip
      label={isFinished ? 'Zakończona' : 'W trakcie'}
      color={isFinished ? 'success' : 'warning'}
      size="small"
      sx={{ alignSelf: 'flex-start' }}
    />
  )
}