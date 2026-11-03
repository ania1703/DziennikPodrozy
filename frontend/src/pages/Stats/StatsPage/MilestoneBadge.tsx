import type { SvgIconComponent } from '@mui/icons-material'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined'
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import type { Milestone, MilestoneCategory } from '../../../utils/milestones'
import { MilestoneBadgeRoot, MilestoneIcon } from './StatsPage.styles'

const ICONS: Record<MilestoneCategory, SvgIconComponent> = {
  trips: LuggageOutlinedIcon,
  countries: FlagOutlinedIcon,
  europe: PublicOutlinedIcon,
  continents: ExploreOutlinedIcon,
  distance: RouteOutlinedIcon,
  days: CalendarMonthOutlinedIcon,
  photos: PhotoCameraOutlinedIcon,
  recordings: MicNoneOutlinedIcon,
  farthest: FlightTakeoffOutlinedIcon,
}

interface MilestoneBadgeProps {
  milestone: Milestone
}

function MilestoneBadge({ milestone }: MilestoneBadgeProps) {
  const Icon = ICONS[milestone.category]

  return (
    <MilestoneBadgeRoot data-achieved={milestone.achieved}>
      <MilestoneIcon data-achieved={milestone.achieved}>
        <Icon />
      </MilestoneIcon>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {milestone.title}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {milestone.description}
        </Typography>

        {milestone.progressLabel && (
          <>
            <LinearProgress
              variant="determinate"
              value={milestone.ratio * 100}
              sx={{ height: 6, borderRadius: 3, marginTop: 1 }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {milestone.progressLabel}
            </Typography>
          </>
        )}
      </div>
    </MilestoneBadgeRoot>
  )
}

export default MilestoneBadge