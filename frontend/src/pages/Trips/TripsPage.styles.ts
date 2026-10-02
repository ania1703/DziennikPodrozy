import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const TripsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 16,
  padding: 24,
})

export const TripCardRoot = styled(Box)({
  position: 'relative',
  height: 200,
  borderRadius: 12,
  backgroundColor: '#37474f',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
})

export const TripCardOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: 4,
  padding: 16,
  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0) 60%)',
})

export const TripFormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  maxWidth: 480,
  padding: 24,
})

export const TripsHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px 24px 0',
})

export const TripDetailsContainer = styled(Box)({
  maxWidth: 900,
  margin: '0 auto',
  padding: 24,
})

export const TripDetailsCover = styled(Box)({
  height: 240,
  borderRadius: 12,
  backgroundColor: '#37474f',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
})

export const TripDetailsContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 12,
  paddingTop: 24,
})