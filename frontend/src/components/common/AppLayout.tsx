import { Link, Outlet } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useAuth } from '../../contexts/useAuth'

export function AppLayout() {
  const { userName, logout } = useAuth()

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dziennik Podróży
          </Typography>

          <Button color="inherit" component={Link} to="/trips">
            Moje podróże
          </Button>

          <Typography variant="body2" sx={{ mx: 2 }}>
            {userName}
          </Typography>

          <Button color="inherit" onClick={logout}>
            Wyloguj
          </Button>
        </Toolbar>
      </AppBar>

      <Outlet />
    </>
  )
}