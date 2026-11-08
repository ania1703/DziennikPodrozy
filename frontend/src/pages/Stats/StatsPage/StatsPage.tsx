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
import PeriodPicker from './PeriodPicker'
import { SectionsGrid, StatsContainer } from './StatsPage.styles'

const TABS = ['overview', 'world', 'milestones'] as const

type StatsTab = (typeof TABS)[number]

function parseTab(value: string | null): StatsTab {
  return TABS.find((tab) => tab === value) ?? 'overview'
}

function parseDate(value: string | null): string | null {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function StatsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))
  const from = parseDate(searchParams.get('from'))
  const to = parseDate(searchParams.get('to'))

  const allTime = useStats()
  const selected = useStats({ from, to })

  function updateParams(changes: {
    tab?: StatsTab
    range?: { from: string | null; to: string | null }
  }) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)

        if (changes.tab) {
          next.set('tab', changes.tab)
        }

        if (changes.range) {
          for (const [key, value] of Object.entries(changes.range)) {
            if (value === null) {
              next.delete(key)
            } else {
              next.set(key, value)
            }
          }
        }

        return next
      },
      { replace: true },
    )
  }

  if (allTime.isLoading) {
    return <LoadingSpinner />
  }

  if (allTime.isError || !allTime.data) {
    return <Alert severity="error">Nie udało się wczytać statystyk.</Alert>
  }

  const { firstDate, lastDate, years } = allTime.data
  const stats = selected.data
  const hasRange = from !== null || to !== null

  return (
    <StatsContainer>
      <Typography variant="h4" component="h1">
        Moje statystyki
      </Typography>

      <Typography variant="body2" sx={{ marginTop: 1, color: 'text.secondary' }}>
        Liczymy podróże ze statusem „W trakcie” i „Zakończona”. Kilometry to odległość w
        linii prostej między kolejnymi przystankami.
      </Typography>

      {firstDate && lastDate && (
        <PeriodPicker
          key={`${firstDate}-${lastDate}`}
          firstDate={firstDate}
          lastDate={lastDate}
          years={years}
          from={from}
          to={to}
          onChange={(nextFrom, nextTo) =>
            updateParams({ range: { from: nextFrom, to: nextTo } })
          }
        />
      )}

      <Tabs
        value={tab}
        onChange={(_event, value: StatsTab) => updateParams({ tab: value })}
        sx={{ marginTop: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Przegląd" value="overview" />
        <Tab label="Świat" value="world" />
        <Tab label="Osiągnięcia" value="milestones" />
      </Tabs>

      {tab === 'milestones' && (
        <>
          {hasRange && (
            <Typography variant="body2" sx={{ marginTop: 2, color: 'text.secondary' }}>
              Osiągnięcia liczymy z całej historii podróży, niezależnie od wybranego okresu.
            </Typography>
          )}

          <MilestonesSection stats={allTime.data} />
        </>
      )}

      {tab !== 'milestones' && selected.isLoading && <LoadingSpinner />}

      {tab !== 'milestones' && selected.isError && (
        <Alert severity="error" sx={{ marginTop: 3 }}>
          Nie udało się wczytać statystyk dla wybranego okresu.
        </Alert>
      )}

      {tab === 'overview' && stats && (
        <OverviewTab key={`${from}-${to}`} stats={stats} />
      )}

      {tab === 'world' && stats && (
        <SectionsGrid key={`${from}-${to}`}>
          <CountriesSection codes={stats.countryCodes} />
          <ExplorationSection codes={stats.countryCodes} />
        </SectionsGrid>
      )}
    </StatsContainer>
  )
}

export default StatsPage