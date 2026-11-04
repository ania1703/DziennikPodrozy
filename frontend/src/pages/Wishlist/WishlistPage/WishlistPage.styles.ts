import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export const WishlistContainer = styled(Box)({
  maxWidth: 1100,
  margin: '0 auto',
  padding: 24,
})

export const WishlistHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 16,
})

export const WishlistGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 16,
  marginTop: 24,
})

export const WishlistCardRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 20,
  borderRadius: 16,
  border: '1px solid #EADFCB',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.1)',
}))

export const WishlistCardHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
})

export const WishlistFlag = styled('span')({
  flexShrink: 0,
  fontSize: '1.75rem',
  borderRadius: 3,
  boxShadow: '0 1px 3px rgba(59, 47, 42, 0.3)',
})

export const WishlistNote = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontStyle: 'italic',
  color: theme.palette.text.secondary,
  whiteSpace: 'pre-wrap',
}))

export const WishlistCardFooter = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  marginTop: 'auto',
  paddingTop: 8,
  borderTop: '1px solid #EADFCB',
})

export const EmptyWishlist = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: 64,
  textAlign: 'center',
})