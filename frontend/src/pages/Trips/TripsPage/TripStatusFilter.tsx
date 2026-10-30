import Chip from '@mui/material/Chip'
import type { TripStatus } from '../../../api/useTrips'
import { FilterBar } from './TripsPage.styles'

export type TripFilter = 'All' | TripStatus

interface TripStatusFilterProps {
  value: TripFilter
  counts: Record<TripFilter, number>
  onChange: (filter: TripFilter) => void
}

const OPTIONS: { value: TripFilter; label: string }[] = [
  { value: 'All', label: 'Wszystkie' },
  { value: 'InProgress', label: 'W trakcie' },
  { value: 'Planned', label: 'Zaplanowane' },
  { value: 'Finished', label: 'Zakończone' },
]

function TripStatusFilter({ value, counts, onChange }: TripStatusFilterProps) {
  return (
    <FilterBar>
      {OPTIONS.map((option) => {
        const selected = value === option.value
        const isEmpty = option.value !== 'All' && counts[option.value] === 0

        return (
          <Chip
            key={option.value}
            label={`${option.label} (${counts[option.value]})`}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            disabled={isEmpty}
            onClick={() => onChange(option.value)}
          />
        )
      })}
    </FilterBar>
  )
}

export default TripStatusFilter