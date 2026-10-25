import { Link, Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import { getFileUrl } from '../../api/fileUrl'
import { useProfile } from '../../api/useProfile'
import { useAuth } from '../../contexts/useAuth'
import { Brand, NavToolbar, UserAvatar } from './AppLayout.styles'

export function AppLayout() {
  const { userName, logout } = useAuth()
  const { data: profile } = useProfile()

  return (
    <>
      <AppBar position="static" elevation={1}>
        <NavToolbar>
          <Brand to="/trips">Dziennik Podróży</Brand>

          <Button color="inherit" component={Link} to="/trips">
            Moje podróże
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/profile"
            startIcon={
              <UserAvatar src={getFileUrl(profile?.avatarUrl ?? null)}>
                {userName?.charAt(0).toUpperCase()}
              </UserAvatar>
            }
          >
            {userName}
          </Button>

          <Button color="inherit" onClick={logout}>
            Wyloguj
          </Button>
        </NavToolbar>
      </AppBar>

      <Outlet />
    </>
  )
}