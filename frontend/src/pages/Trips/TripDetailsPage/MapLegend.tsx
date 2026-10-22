import Typography from '@mui/material/Typography'
import { getDayColor } from '../../../utils/dayColors'
import type { StopDay } from '../../../utils/groupStopsByDay'
import { DayDot, LegendItem, MapLegendRoot } from './TripDetailsPage.styles'

interface MapLegendProps {
  days: StopDay[]
}

function MapLegend({ days }: MapLegendProps) {
  if (days.length < 2) {
    return null
  }

  return (
    <MapLegendRoot>
      {days.map((day) => (
        <LegendItem key={day.date}>
          <DayDot style={{ backgroundColor: getDayColor(day.dayNumber) }} />

          <Typography variant="caption">Dzień {day.dayNumber}</Typography>
        </LegendItem>
      ))}
    </MapLegendRoot>
  )
}

export default MapLegend