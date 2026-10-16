import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const TripDetailsContainer = styled(Box)({
  maxWidth: 1400,
  margin: '0 auto',
  padding: 24,
})

export const TripDetailsCard = styled(Box)(({ theme }) => ({
  marginTop: 16,
  overflow: 'clip',
  borderRadius: 16,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.1)',
}))

export const TripDetailsCover = styled(Box)({
  height: 340,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
})

export const TripDetailsContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 32,
})

export const TripDetailsStatus = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 16,
})

export const TripDetailsActions = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: 8,
})

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

export const TripPlanSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

export const DayBoxRoot = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  borderRadius: 12,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.default,
}))

export const DayBoxHeader = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: 12,
  padding: '12px 16px',
  borderBottom: '1px solid #EADFCB',
})

export const DayBoxStops = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 12,
})

export const StopBoxRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&[data-selected="true"]': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 2px 10px rgba(59, 47, 42, 0.15)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}))

export const StopNumber = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 28,
  height: 28,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.background.default,
  fontSize: '0.875rem',
  fontWeight: 600,
}))

export const MapFrame = styled(Box)(({ theme }) => ({
  height: 420,
  [theme.breakpoints.up('md')]: {
    height: 'min(70vh, 640px)',
  },
  overflow: 'hidden',
  borderRadius: 16,
  border: '1px solid #EADFCB',
  '& .leaflet-container': {
    backgroundColor: '#F3EEE3',
  },
  '& .leaflet-tile-pane': {
    filter: 'sepia(0.35) saturate(0.9)',
  },
  '& .stop-marker': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: `2px solid ${theme.palette.background.default}`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 600,
    boxShadow: '0 2px 6px rgba(59, 47, 42, 0.4)',
  },
  '& .stop-marker--active': {
    backgroundColor: theme.palette.secondary.main,
    fontSize: '1.1rem',
    boxShadow: '0 3px 10px rgba(59, 47, 42, 0.5)',
  },
}))

export const PlanLayout = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 24,
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '5fr 6fr',
    alignItems: 'start',
  },
}))

export const PlanMapColumn = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    position: 'sticky',
    top: 16,
    gridColumn: 2,
    gridRow: 1,
  },
}))

export const PlanDays = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  [theme.breakpoints.up('md')]: {
    gridColumn: 1,
    gridRow: 1,
  },
}))