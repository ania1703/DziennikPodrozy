import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const FormPageContainer = styled(Box)({
  maxWidth: 720,
  margin: '0 auto',
  padding: 24,
})

export const FormCard = styled(Box)(({ theme }) => ({
  marginTop: 16,
  padding: 32,
  borderRadius: 16,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.1)',
}))