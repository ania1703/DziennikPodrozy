import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const AdminContainer = styled(Box)({
  maxWidth: 1200,
  margin: '0 auto',
  padding: 24,
})

export const SummaryGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 16,
  marginTop: 24,
})

export const SummaryTile = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 20,
  borderRadius: 16,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.1)',
}))

export const TableCard = styled(Box)(({ theme }) => ({
  marginTop: 24,
  overflow: 'hidden',
  borderRadius: 16,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.1)',
}))

export const UserCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
})