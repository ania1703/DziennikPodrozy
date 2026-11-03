import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import {
  CONTINENT_LABELS,
  getContinentProgress,
  getVisitedContinents,
  getWorldProgress,
  type Continent,
  type Progress,
} from '../../../utils/countries'
import { ChipRow, ProgressHeader, ProgressRow, SectionCard } from './StatsPage.styles'
import { useCountUp } from '../../../hooks/useCountUp'

interface ProgressBarProps {
  label: string
  progress: Progress
}

function ProgressBar({ label, progress }: ProgressBarProps) {
  const percentText = progress.percent.toLocaleString('pl-PL', { maximumFractionDigits: 1 })
  const animatedPercent = useCountUp(progress.percent)

  return (
    <ProgressRow>
      <ProgressHeader>
        <Typography variant="subtitle2">{label}</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {progress.visited} z {progress.total} krajów ({percentText}%)
        </Typography>
      </ProgressHeader>

      <LinearProgress
        variant="determinate"
        value={animatedPercent}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </ProgressRow>
  )
}

interface ExplorationSectionProps {
  codes: string[]
}

function ExplorationSection({ codes }: ExplorationSectionProps) {
  const visitedContinents = getVisitedContinents(codes)
  const continents = Object.keys(CONTINENT_LABELS) as Continent[]

  return (
    <SectionCard>
      <Typography variant="h6" component="h2">
        Zdobyta mapa
      </Typography>

      <ProgressBar label="Europa" progress={getContinentProgress(codes, 'Europe')} />
      <ProgressBar label="Świat" progress={getWorldProgress(codes)} />

      <Typography variant="subtitle2" sx={{ marginTop: 3 }}>
        Kontynenty: {visitedContinents.length} z {continents.length}
      </Typography>

      <ChipRow>
        {continents.map((continent) => {
          const visited = visitedContinents.includes(continent)

          return (
            <Chip
              key={continent}
              label={CONTINENT_LABELS[continent]}
              color={visited ? 'primary' : 'default'}
              variant={visited ? 'filled' : 'outlined'}
              sx={visited ? undefined : { opacity: 0.55 }}
            />
          )
        })}
      </ChipRow>
    </SectionCard>
  )
}

export default ExplorationSection