import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const TripsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 24,
  padding: 24,
  maxWidth: 1200,
  margin: '0 auto',
})

export const TripCardRoot = styled(Box)({
  position: 'relative',
  height: 220,
  borderRadius: 16,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.15)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(59, 47, 42, 0.25)',
  },
})

export const TripCardOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: 4,
  padding: 16,
  background: 'linear-gradient(to top, rgba(40, 25, 18, 0.8), rgba(40, 25, 18, 0) 65%)',
})

export const TripsHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '32px 24px 0',
  maxWidth: 1200,
  margin: '0 auto',
})

export const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: 64,
  textAlign: 'center',
})