import Typography from '@mui/material/Typography'
import { formatDateRange } from '../../../utils/formatDate'
import type { StopDay } from '../../../utils/groupStopsByDay'
import StopBox from './StopBox'
import { DayBoxHeader, DayBoxRoot, DayBoxStops } from './TripDetailsPage.styles'

interface DayBoxProps {
  day: StopDay
  firstNumber: number
}

function DayBox({ day, firstNumber }: DayBoxProps) {
  return (
    <DayBoxRoot>
      <DayBoxHeader>
        <Typography variant="h6" component="h3">
          Dzień {day.dayNumber}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {formatDateRange(day.date, null)}
        </Typography>
      </DayBoxHeader>

      <DayBoxStops>
        {day.stops.map((stop, index) => (
          <StopBox key={stop.id} stop={stop} number={firstNumber + index} />
        ))}
      </DayBoxStops>
    </DayBoxRoot>
  )
}

export default DayBox