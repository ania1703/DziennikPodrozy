import { useState } from 'react'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { formatDateRange } from '../../../utils/formatDate'
import type { StopDay } from '../../../utils/groupStopsByDay'
import DayNote from './DayNote'
import StopBox from './StopBox'
import { DayBoxHeader, DayBoxRoot, DayBoxStops, DayDot } from './TripDetailsPage.styles'
import type { TripStop } from '../../../api/useTripStops'
import { getDayColor } from '../../../utils/dayColors'

interface DayBoxProps {
  day: StopDay
  tripId: number
  firstNumber: number
  note: string | null
  selectedStopId: number | null
  onToggleStop: (stopId: number) => void
  onEditStop: (stop: TripStop) => void
  onDeleteStop: (stop: TripStop) => void
}

function DayBox({
  day,
  firstNumber,
  note,
  selectedStopId,
  onToggleStop,
  onEditStop,
  onDeleteStop,
  tripId
}: DayBoxProps) {
  const [editingNote, setEditingNote] = useState(false)
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

        {!editingNote && (
          <Button
            size="small"
            startIcon={<EditNoteOutlinedIcon />}
            onClick={() => setEditingNote(true)}
            sx={{ marginLeft: 'auto' }}
          >
            {note ? 'Edytuj podsumowanie' : 'Dodaj podsumowanie dnia'}
          </Button>
        )}
      </DayBoxHeader>

      <DayNote
        tripId={tripId}
        date={day.date}
        note={note}
        editing={editingNote}
        onClose={() => setEditingNote(false)}
      />

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
            tripId={tripId}
          />
        ))}
      </DayBoxStops>
    </DayBoxRoot>
  )
}

export default DayBox