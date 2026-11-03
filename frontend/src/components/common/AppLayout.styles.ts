import { styled } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Avatar from '@mui/material/Avatar'
import { Link } from 'react-router-dom'

export const NavToolbar = styled(Toolbar)({
  gap: 8,
})

export const Brand = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexGrow: 1,
  color: 'inherit',
  textDecoration: 'none',
  fontSize: '1.5rem',
  fontWeight: 700,
})

export const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontSize: '1rem',
  backgroundColor: theme.palette.secondary.main,
}))