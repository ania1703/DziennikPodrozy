import { Link, Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useAuth } from '../../contexts/useAuth'
import { Brand, NavToolbar, UserAvatar } from './AppLayout.styles'

export function AppLayout() {
  const { userName, logout } = useAuth()

  return (
    <>
      <AppBar position="static" elevation={1}>
        <NavToolbar>
          <Brand to="/trips">Dziennik Podróży</Brand>

          <Button color="inherit" component={Link} to="/trips">
            Moje podróże
          </Button>

          <UserAvatar>{userName?.charAt(0).toUpperCase()}</UserAvatar>

          <Typography variant="body2">{userName}</Typography>

          <Button color="inherit" onClick={logout}>
            Wyloguj
          </Button>
        </NavToolbar>
      </AppBar>

      <Outlet />
    </>
  )
}