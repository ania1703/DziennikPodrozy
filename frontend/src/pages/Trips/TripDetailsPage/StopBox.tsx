import Typography from '@mui/material/Typography'
import type { TripStop } from '../../../api/useTripStops'
import { StopBoxRoot, StopNumber } from './TripDetailsPage.styles'

interface StopBoxProps {
  stop: TripStop
  number: number
}

function StopBox({ stop, number }: StopBoxProps) {
  return (
    <StopBoxRoot>
      <StopNumber>{number}</StopNumber>

      <div>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {stop.title}
        </Typography>

        {stop.note && (
          <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
            {stop.note}
          </Typography>
        )}
      </div>
    </StopBoxRoot>
  )
}

export default StopBox