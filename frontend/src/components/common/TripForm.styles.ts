import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const TripFormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
})

export const TripFormActions = styled(Box)({
  display: 'flex',
  gap: 8,
})