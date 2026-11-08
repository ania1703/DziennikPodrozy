import { useState, type MouseEvent } from 'react'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { dayToIso, isoToDay } from '../../../utils/dateRange'
import { formatDateRange } from '../../../utils/formatDate'
import { PeriodFields, SectionCard, StatsHeader } from './StatsPage.styles'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

type PeriodMode = 'range' | 'day'

interface PeriodPickerProps {
  firstDate: string
  lastDate: string
  years: number[]
  from: string | null
  to: string | null
  onChange: (from: string | null, to: string | null) => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function PeriodPicker({ firstDate, lastDate, years, from, to, onChange }: PeriodPickerProps) {
  const minDay = isoToDay(firstDate)
  const maxDay = Math.max(minDay, isoToDay(lastDate))
  const start = clamp(from ? isoToDay(from) : minDay, minDay, maxDay)
  const end = clamp(to ? isoToDay(to) : maxDay, minDay, maxDay)

  const [mode, setMode] = useState<PeriodMode>(from !== null && from === to ? 'day' : 'range')
  const [draft, setDraft] = useState<number | number[] | null>(null)
  const [yearAnchor, setYearAnchor] = useState<HTMLElement | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const lastYearStart = dayToIso(isoToDay(today) - 365)

  const isAllTime = from === null && to === null
  const isLastYear = from === lastYearStart && to === today
  const selectedYear = years.find((year) => from === `${year}-01-01` && to === `${year}-12-31`)
  const shownFrom = from ?? firstDate
  const shownTo = to ?? lastDate

  const marks = []

  for (let year = Number(firstDate.slice(0, 4)) + 1; year <= Number(lastDate.slice(0, 4)); year++) {
    marks.push({ value: isoToDay(`${year}-01-01`), label: String(year) })
  }

  const summary = isAllTime
    ? 'Cała historia podróży'
    : shownFrom === shownTo
      ? formatDateRange(shownFrom, null)
      : formatDateRange(shownFrom, shownTo)

  function commitRange(startDay: number, endDay: number) {
    const low = Math.min(startDay, endDay)
    const high = Math.max(startDay, endDay)

    if (low <= minDay && high >= maxDay) {
      onChange(null, null)
    } else {
      onChange(dayToIso(low), dayToIso(high))
    }
  }

  function handleSliderCommit(value: number | number[]) {
    setDraft(null)

    if (Array.isArray(value)) {
      commitRange(value[0], value[1])
    } else {
      onChange(dayToIso(value), dayToIso(value))
    }
  }

  function handleModeChange(_event: MouseEvent<HTMLElement>, next: PeriodMode | null) {
    if (!next || next === mode) {
      return
    }

    setMode(next)

    if (next === 'day') {
      onChange(dayToIso(start), dayToIso(start))
    } else {
      onChange(null, null)
    }
  }

  function handlePreset(year: number | null) {
    setMode('range')

    if (year === null) {
      onChange(null, null)
    } else {
      onChange(`${year}-01-01`, `${year}-12-31`)
    }
  }

  function handleLastYear() {
    setMode('range')
    onChange(lastYearStart, today)
  }

  return (
    <SectionCard sx={{ marginTop: 3 }}>
      <StatsHeader>
        <div>
          <Typography variant="h6" component="h2">
            Okres
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {summary}
          </Typography>
        </div>

        <ToggleButtonGroup exclusive size="small" value={mode} onChange={handleModeChange}>
          <ToggleButton value="range">Zakres</ToggleButton>
          <ToggleButton value="day">Jeden dzień</ToggleButton>
        </ToggleButtonGroup>
      </StatsHeader>

      <Slider
        value={draft ?? (mode === 'day' ? start : [start, end])}
        min={minDay}
        max={maxDay}
        step={1}
        marks={marks}
        disableSwap
        valueLabelDisplay="auto"
        valueLabelFormat={(day) => formatDateRange(dayToIso(day), null)}
        onChange={(_event, value) => setDraft(value)}
        onChangeCommitted={(_event, value) => handleSliderCommit(value)}
        sx={{
          width: 'calc(100% - 24px)',
          marginX: '12px',
          marginTop: 2,
          marginBottom: 3,
          height: 8,
          '& .MuiSlider-rail': {
            height: 8,
            borderRadius: 4,
            opacity: 1,
            backgroundColor: '#EADFCB',
          },
          '& .MuiSlider-track': {
            height: 8,
            borderRadius: 4,
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            width: 22,
            height: 22,
            border: '3px solid #FFFDF8',
            boxShadow: '0 1px 4px rgba(59, 47, 42, 0.4)',
          },
          '& .MuiSlider-mark': {
            width: 2,
            height: 16,
            borderRadius: 1,
            opacity: 1,
            backgroundColor: '#A98F72',
          },
          '& .MuiSlider-markLabel': {
            top: 30,
            fontSize: '0.85rem',
            color: 'text.secondary',
          },
        }}
      />

      <PeriodFields>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {mode === 'range' ? (
            <>
              <TextField
                label="Od"
                type="date"
                size="small"
                value={shownFrom}
                onChange={(event) => {
                  if (event.target.value) {
                    const day = isoToDay(event.target.value)
                    commitRange(day, Math.max(day, end))
                  }
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                label="Do"
                type="date"
                size="small"
                value={shownTo}
                onChange={(event) => {
                  if (event.target.value) {
                    const day = isoToDay(event.target.value)
                    commitRange(Math.min(day, start), day)
                  }
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          ) : (
            <TextField
              label="Data"
              type="date"
              size="small"
              value={shownFrom}
              onChange={(event) => {
                if (event.target.value) {
                  onChange(event.target.value, event.target.value)
                }
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Chip
            label="Cały czas"
            color={isAllTime ? 'primary' : 'default'}
            variant={isAllTime ? 'filled' : 'outlined'}
            onClick={() => handlePreset(null)}
          />

          <Chip
            label="Ostatnie 12 miesięcy"
            color={isLastYear ? 'primary' : 'default'}
            variant={isLastYear ? 'filled' : 'outlined'}
            onClick={handleLastYear}
          />

                    <Chip
            label={selectedYear ?? 'Rok'}
            color={selectedYear ? 'primary' : 'default'}
            variant={selectedYear ? 'filled' : 'outlined'}
            deleteIcon={<ArrowDropDownIcon />}
            onClick={(event) => setYearAnchor(event.currentTarget)}
            onDelete={(event) => setYearAnchor(event.currentTarget)}
          />

          <Menu
            anchorEl={yearAnchor}
            open={Boolean(yearAnchor)}
            onClose={() => setYearAnchor(null)}
          >
            {years.map((year) => (
              <MenuItem
                key={year}
                selected={year === selectedYear}
                onClick={() => {
                  setYearAnchor(null)
                  handlePreset(year)
                }}
              >
                {year}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </PeriodFields>
    </SectionCard>
  )
}

export default PeriodPicker