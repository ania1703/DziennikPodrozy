import Chip from '@mui/material/Chip'
import type { TripStatus } from '../../api/useTrips'

const LABELS: Record<TripStatus, string> = {
  Planned: 'Zaplanowana',
  InProgress: 'W trakcie',
  Finished: 'Zakończona',
}

const COLORS: Record<TripStatus, 'default' | 'warning' | 'success'> = {
  Planned: 'default',
  InProgress: 'warning',
  Finished: 'success',
}

interface TripStatusChipProps {
  status: TripStatus
  size?: 'small' | 'medium'
}

export function TripStatusChip({ status, size = 'small' }: TripStatusChipProps) {
  return (
    <Chip
      label={LABELS[status]}
      color={COLORS[status]}
      size={size}
      sx={{
        alignSelf: 'flex-start',
        ...(status === 'Planned' && {
          backgroundColor: '#EADFCB',
          color: 'text.primary',
        }),
      }}
    />
  )
}