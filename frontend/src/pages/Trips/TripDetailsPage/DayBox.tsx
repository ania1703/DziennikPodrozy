import Typography from '@mui/material/Typography'
import { formatDateRange } from '../../../utils/formatDate'
import type { StopDay } from '../../../utils/groupStopsByDay'
import StopBox from './StopBox'
import { DayBoxHeader, DayBoxRoot, DayBoxStops, DayDot } from './TripDetailsPage.styles'
import type { TripStop } from '../../../api/useTripStops'
import { getDayColor } from '../../../utils/dayColors'

interface DayBoxProps {
  day: StopDay
  firstNumber: number
  selectedStopId: number | null
  onToggleStop: (stopId: number) => void
  onEditStop: (stop: TripStop) => void
  onDeleteStop: (stop: TripStop) => void
}

function DayBox({
  day,
  firstNumber,
  selectedStopId,
  onToggleStop,
  onEditStop,
  onDeleteStop,
}: DayBoxProps) {
  const color = getDayColor(day.dayNumber)
  return (
    <DayBoxRoot>
      <DayBoxHeader>
        <DayDot style={{ backgroundColor: color }} />

        <Typography variant="h6" component="h3">
          Dzień {day.dayNumber}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {formatDateRange(day.date, null)}
        </Typography>
      </DayBoxHeader>

      <DayBoxStops>
        {day.stops.map((stop, index) => (
          <StopBox
            key={stop.id}
            stop={stop}
            number={firstNumber + index}
            color={color}
            selected={stop.id === selectedStopId}
            onToggle={onToggleStop}
            onEdit={onEditStop}
            onDelete={onDeleteStop}
          />
        ))}
      </DayBoxStops>
    </DayBoxRoot>
  )
}

export default DayBox