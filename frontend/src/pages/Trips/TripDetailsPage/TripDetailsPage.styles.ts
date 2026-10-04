import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const TripDetailsContainer = styled(Box)({
  maxWidth: 1200,
  margin: '0 auto',
  padding: 24,
})

export const TripDetailsCard = styled(Box)(({ theme }) => ({
  marginTop: 16,
  overflow: 'hidden',
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