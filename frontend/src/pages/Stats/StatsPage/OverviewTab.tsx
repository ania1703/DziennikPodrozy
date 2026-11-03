import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import Typography from '@mui/material/Typography'
import type { Stats } from '../../../api/useStats'
import AnimatedNumber from './AnimatedNumber'
import FarthestPointSection from './FarthestPointSection'
import { Tile, TileHeader, TilesGrid } from './StatsPage.styles'

interface OverviewTabProps {
  stats: Stats
}

function OverviewTab({ stats }: OverviewTabProps) {
  const tiles = [
    { label: 'Podróże', value: stats.tripCount, Icon: LuggageOutlinedIcon },
    { label: 'Dni w drodze', value: stats.dayCount, Icon: CalendarMonthOutlinedIcon },
    { label: 'Odwiedzone miejsca', value: stats.stopCount, Icon: PlaceOutlinedIcon },
    { label: 'Zdjęcia', value: stats.photoCount, Icon: PhotoCameraOutlinedIcon },
    { label: 'Nagrania', value: stats.recordingCount, Icon: MicNoneOutlinedIcon },
    { label: 'Przebyte kilometry', value: stats.distanceKm, Icon: RouteOutlinedIcon },
  ]

  return (
    <>
      <TilesGrid>
        {tiles.map((tile) => (
          <Tile key={tile.label}>
            <TileHeader>
              <Typography
                variant="h4"
                component="p"
                sx={{ color: 'primary.main', fontWeight: 700 }}
              >
                <AnimatedNumber value={tile.value} />
              </Typography>

              <tile.Icon sx={{ color: 'primary.main', opacity: 0.45 }} />
            </TileHeader>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {tile.label}
            </Typography>
          </Tile>
        ))}
      </TilesGrid>

      <FarthestPointSection stats={stats} />
    </>
  )
}

export default OverviewTab