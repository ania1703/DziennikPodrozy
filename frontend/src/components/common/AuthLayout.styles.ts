import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

export const AuthPage = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
})

export const BrandPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'none',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: 64,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.background.default,
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}))

export const BrandMap = styled('img')({
  width: '100%',
  maxWidth: 720,
  marginTop: 48,
})

export const FormPanel = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
})