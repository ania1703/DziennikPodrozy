import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const StatsContainer = styled(Box)({
  maxWidth: 1100,
  margin: '0 auto',
  padding: 24,
})

export const TilesGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 16,
  marginTop: 24,
})

export const Tile = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 20,
  borderRadius: 16,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.1)',
}))

export const TileHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
})

export const SectionsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 24,
  marginTop: 24,
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}))

export const SectionCard = styled(Box)(({ theme }) => ({
  padding: 24,
  borderRadius: 16,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.1)',
}))

export const FlagGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: 12,
  marginTop: 16,
})

export const FlagCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: 16,
  borderRadius: 12,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.default,
  textAlign: 'center',
}))

export const Flag = styled('span')({
  fontSize: '3rem',
  borderRadius: 4,
  boxShadow: '0 1px 4px rgba(59, 47, 42, 0.3)',
})

export const ChipRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 16,
})

export const ProgressRow = styled(Box)({
  marginTop: 16,
})

export const ProgressHeader = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 4,
})

export const MilestoneGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 12,
  marginTop: 16,
})

export const MilestoneBadgeRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: 16,
  borderRadius: 12,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.default,
  '&[data-achieved="true"]': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
  },
  '&[data-achieved="false"]': {
    opacity: 0.65,
  },
}))

export const MilestoneIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 44,
  height: 44,
  borderRadius: '50%',
  backgroundColor: '#EADFCB',
  color: theme.palette.text.secondary,
  '&[data-achieved="true"]': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
  },
}))

export const StatsHeader = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 16,
})

export const PeriodFields = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  marginTop: 8,
})