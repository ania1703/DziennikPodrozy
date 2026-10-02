import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

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