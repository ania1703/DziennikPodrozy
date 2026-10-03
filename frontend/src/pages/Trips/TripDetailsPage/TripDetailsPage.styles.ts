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