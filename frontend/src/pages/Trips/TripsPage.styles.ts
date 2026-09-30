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