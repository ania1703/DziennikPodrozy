import { useSearchParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useStats } from '../../../api/useStats'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import CountriesSection from './CountriesSection'
import ExplorationSection from './ExplorationSection'
import MilestonesSection from './MilestonesSection'
import OverviewTab from './OverviewTab'
import { SectionsGrid, StatsContainer } from './StatsPage.styles'

const TABS = ['overview', 'world', 'milestones'] as const

type StatsTab = (typeof TABS)[number]

function parseTab(value: string | null): StatsTab {
  return TABS.find((tab) => tab === value) ?? 'overview'
}

function StatsPage() {
  const { data: stats, isLoading, isError } = useStats()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !stats) {
    return <Alert severity="error">Nie udało się wczytać statystyk.</Alert>
  }

  return (
    <StatsContainer>
      <Typography variant="h4" component="h1">
        Moje statystyki
      </Typography>

      <Typography variant="body2" sx={{ marginTop: 1, color: 'text.secondary' }}>
        Liczymy podróże ze statusem „W trakcie” i „Zakończona”. Kilometry to odległość w
        linii prostej między kolejnymi przystankami.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_event, value: StatsTab) => setSearchParams({ tab: value }, { replace: true })}
        sx={{ marginTop: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Przegląd" value="overview" />
        <Tab label="Świat" value="world" />
        <Tab label="Osiągnięcia" value="milestones" />
      </Tabs>

      {tab === 'overview' && <OverviewTab stats={stats} />}

      {tab === 'world' && (
        <SectionsGrid>
          <CountriesSection codes={stats.countryCodes} />
          <ExplorationSection codes={stats.countryCodes} />
        </SectionsGrid>
      )}

      {tab === 'milestones' && <MilestonesSection stats={stats} />}
    </StatsContainer>
  )
}

export default StatsPage