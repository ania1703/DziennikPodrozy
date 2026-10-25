import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

export const ProfileHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  flexWrap: 'wrap',
})

export const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 96,
  height: 96,
  fontSize: '2.5rem',
  backgroundColor: theme.palette.secondary.main,
}))

export const ProfileFormRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  marginTop: 32,
})

export const HomeCitySection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
})