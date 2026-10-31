import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { useStats } from '../../../api/useStats'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import CountriesSection from './CountriesSection'
import ExplorationSection from './ExplorationSection'
import FarthestPointSection from './FarthestPointSection'
import {
  SectionsGrid,
  StatsContainer,
  Tile,
  TileHeader,
  TilesGrid,
} from './StatsPage.styles'

function StatsPage() {
  const { data: stats, isLoading, isError } = useStats()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !stats) {
    return <Alert severity="error">Nie udało się wczytać statystyk.</Alert>
  }

  const tiles = [
    { label: 'Podróże', value: stats.tripCount, Icon: LuggageOutlinedIcon },
    { label: 'Dni w drodze', value: stats.dayCount, Icon: CalendarMonthOutlinedIcon },
    { label: 'Odwiedzone miejsca', value: stats.stopCount, Icon: PlaceOutlinedIcon },
    { label: 'Zdjęcia', value: stats.photoCount, Icon: PhotoCameraOutlinedIcon },
    { label: 'Nagrania', value: stats.recordingCount, Icon: MicNoneOutlinedIcon },
    { label: 'Przebyte kilometry', value: stats.distanceKm, Icon: RouteOutlinedIcon },
  ]

  return (
    <StatsContainer>
      <Typography variant="h4" component="h1">
        Moje statystyki
      </Typography>

      <Typography variant="body2" sx={{ marginTop: 1, color: 'text.secondary' }}>
        Liczymy podróże ze statusem „W trakcie” i „Zakończona”. Kilometry to odległość w
        linii prostej między kolejnymi przystankami.
      </Typography>

      <TilesGrid>
        {tiles.map((tile) => (
          <Tile key={tile.label}>
            <TileHeader>
              <Typography
                variant="h4"
                component="p"
                sx={{ color: 'primary.main', fontWeight: 700 }}
              >
                {tile.value.toLocaleString('pl-PL')}
              </Typography>

              <tile.Icon sx={{ color: 'primary.main', opacity: 0.45 }} />
            </TileHeader>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {tile.label}
            </Typography>
          </Tile>
        ))}
      </TilesGrid>

      <SectionsGrid>
        <CountriesSection codes={stats.countryCodes} />
        <ExplorationSection codes={stats.countryCodes} />
      </SectionsGrid>

      <FarthestPointSection stats={stats} />
    </StatsContainer>
  )
}

export default StatsPage