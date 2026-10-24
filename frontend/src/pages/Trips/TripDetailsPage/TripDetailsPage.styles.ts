import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

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
  isolation: 'isolate',
  borderRadius: 16,
  border: '1px solid #EADFCB',
  '& .leaflet-container': {
    backgroundColor: '#F3EEE3',
  },
  '& .leaflet-tile-pane': {
    filter: 'sepia(0.35) saturate(0.9)',
  },
  '& .stop-pin': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: `2px solid ${theme.palette.background.default}`,
    color: theme.palette.background.default,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 600,
    boxShadow: '0 2px 6px rgba(59, 47, 42, 0.4)',
    transition: 'transform 0.15s',
  },
  '& .stop-pin--active': {
    transform: 'scale(1.3)',
    boxShadow: '0 0 0 3px rgba(59, 47, 42, 0.35), 0 3px 10px rgba(59, 47, 42, 0.5)',
  },
  '& .stop-pin--pending': {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    border: `2px dashed ${theme.palette.primary.main}`,
    fontSize: '1.25rem',
  },
  '&[data-adding="true"] .leaflet-grab, &[data-adding="true"] .leaflet-interactive': {
    cursor: 'crosshair',
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
  position: 'relative',
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

export const PlaceSearchForm = styled('form')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
})

export const PlaceResults = styled(Box)(({ theme }) => ({
  marginTop: 8,
  maxHeight: 240,
  overflowY: 'auto',
  borderRadius: 12,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
}))

export const MapOverlay = styled(Box)({
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 1,
  width: 'calc(100% - 24px)',
  maxWidth: 420,
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'auto',
  },
})

export const MapSearchCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 12,
  borderRadius: 12,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 14px rgba(59, 47, 42, 0.2)',
}))

export const MapSearchFooter = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
})

export const StopActions = styled(Box)({
  display: 'flex',
  gap: 8,
  marginTop: 8,
})

export const DayDot = styled(Box)({
  flexShrink: 0,
  alignSelf: 'center',
  width: 12,
  height: 12,
  borderRadius: '50%',
})

export const MapLegendRoot = styled(Box)({
  position: 'absolute',
  bottom: 12,
  left: 12,
  zIndex: 1,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  maxWidth: 'calc(100% - 100px)',
  padding: '6px 12px',
  borderRadius: 10,
  border: '1px solid #EADFCB',
  backgroundColor: 'rgba(255, 253, 248, 0.92)',
})

export const LegendItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
})

export const RichTextRoot = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  '& > *:first-of-type': {
    marginTop: 0,
  },
  '& > *:last-child': {
    marginBottom: 0,
  },
  '& p': {
    margin: '0 0 8px',
  },
  '& ul, & ol': {
    margin: '0 0 8px',
    paddingLeft: 24,
  },
  '& h2, & h3': {
    margin: '12px 0 4px',
  },
}))

export const StopPreview = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}))

export const EditorFrame = styled(Box)(({ theme }) => ({
  border: '1px solid rgba(59, 47, 42, 0.3)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
  '& .tiptap': {
    ...theme.typography.body1,
    minHeight: 220,
    maxHeight: 420,
    overflowY: 'auto',
    padding: '12px 14px',
    outline: 'none',
    '& > *:first-of-type': {
      marginTop: 0,
    },
    '& > *:last-child': {
      marginBottom: 0,
    },
    '& p': {
      margin: '0 0 8px',
    },
    '& ul, & ol': {
      margin: '0 0 8px',
      paddingLeft: 24,
    },
    '& h2, & h3': {
      margin: '12px 0 4px',
    },
  },
}))

export const EditorToolbar = styled(Box)({
  display: 'flex',
  gap: 4,
  padding: 4,
  borderBottom: '1px solid #EADFCB',
})

export const StopFormGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 24,
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '5fr 7fr',
  },
}))

export const StopFormColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

export const EntryPlaceholder = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 220,
  padding: 16,
  borderRadius: theme.shape.borderRadius,
  border: '2px dashed #D9C9AE',
  color: theme.palette.text.secondary,
  textAlign: 'center',
}))

export const StopFormSectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}))

export const PhotoSectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  marginTop: 12,
  marginBottom: 8,
})

export const PhotoGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
  gap: 8,
})

export const PhotoThumb = styled('img')({
  display: 'block',
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  borderRadius: 8,
  cursor: 'pointer',
})

export const PhotoCount = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  marginTop: 4,
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
}))