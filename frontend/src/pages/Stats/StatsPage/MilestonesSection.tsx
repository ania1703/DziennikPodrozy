import Typography from '@mui/material/Typography'
import type { Stats } from '../../../api/useStats'
import { getMilestones } from '../../../utils/milestones'
import MilestoneBadge from './MilestoneBadge'
import { MilestoneGrid, SectionCard } from './StatsPage.styles'

interface MilestonesSectionProps {
  stats: Stats
}

function MilestonesSection({ stats }: MilestonesSectionProps) {
  const milestones = getMilestones(stats)
  const achievedCount = milestones.filter((milestone) => milestone.achieved).length

  return (
    <SectionCard sx={{ marginTop: 3 }}>
      <Typography variant="h6" component="h2">
        Osiągnięcia ({achievedCount} z {milestones.length})
      </Typography>

      <MilestoneGrid>
        {milestones.map((milestone) => (
          <MilestoneBadge key={milestone.id} milestone={milestone} />
        ))}
      </MilestoneGrid>
    </SectionCard>
  )
}

export default MilestonesSection