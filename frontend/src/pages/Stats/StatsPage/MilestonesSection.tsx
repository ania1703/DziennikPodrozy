import { useState } from 'react'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import type { Stats } from '../../../api/useStats'
import { getMilestones } from '../../../utils/milestones'
import MilestoneBadge from './MilestoneBadge'
import { ChipRow, MilestoneGrid, SectionCard } from './StatsPage.styles'

type MilestoneFilter = 'next' | 'achieved' | 'all'

const NEXT_COUNT = 6

interface MilestonesSectionProps {
  stats: Stats
}

function MilestonesSection({ stats }: MilestonesSectionProps) {
  const [filter, setFilter] = useState<MilestoneFilter>('next')
  const milestones = getMilestones(stats)
  const achieved = milestones.filter((milestone) => milestone.achieved)
  const pending = milestones
    .filter((milestone) => !milestone.achieved)
    .sort((a, b) => b.ratio - a.ratio)

  const filters: { value: MilestoneFilter; label: string }[] = [
    { value: 'next', label: 'Najbliższe' },
    { value: 'achieved', label: `Zdobyte (${achieved.length})` },
    { value: 'all', label: `Wszystkie (${milestones.length})` },
  ]

  const visible =
    filter === 'achieved' ? achieved : filter === 'all' ? milestones : pending.slice(0, NEXT_COUNT)

  return (
    <SectionCard sx={{ marginTop: 3 }}>
      <Typography variant="h6" component="h2">
        Osiągnięcia ({achieved.length} z {milestones.length})
      </Typography>

      <ChipRow>
        {filters.map((option) => {
          const selected = filter === option.value

          return (
            <Chip
              key={option.value}
              label={option.label}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => setFilter(option.value)}
            />
          )
        })}
      </ChipRow>

      {visible.length === 0 ? (
        <Typography variant="body2" sx={{ marginTop: 2, color: 'text.secondary' }}>
          {filter === 'achieved'
            ? 'Jeszcze nic nie zdobyto. Odbądź pierwszą podróż!'
            : 'Wszystkie osiągnięcia zdobyte, gratulacje!'}
        </Typography>
      ) : (
        <MilestoneGrid>
          {visible.map((milestone) => (
            <MilestoneBadge key={milestone.id} milestone={milestone} />
          ))}
        </MilestoneGrid>
      )}
    </SectionCard>
  )
}

export default MilestonesSection