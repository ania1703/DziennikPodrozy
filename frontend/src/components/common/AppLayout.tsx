import { useState, type MouseEvent } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { getFileUrl } from '../../api/fileUrl'
import { useProfile } from '../../api/useProfile'
import { useAuth } from '../../contexts/useAuth'
import { Brand, NavToolbar, UserAvatar } from './AppLayout.styles'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { ChangePasswordDialog } from './ChangePasswordDialog'

const navButtonSx = {
  paddingX: 2,
  borderRadius: 999,
  '&.active': {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
}

export function AppLayout() {
  const { userName, roles, logout } = useAuth()
  const isAdmin = roles.includes('Admin')
  const { data: profile } = useProfile()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  function handleOpenMenu(event: MouseEvent<HTMLElement>) {
    setMenuAnchor(event.currentTarget)
  }

  function handleCloseMenu() {
    setMenuAnchor(null)
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, #7F4A33 0%, #6A3D2A 100%)',
          boxShadow: '0 2px 10px rgba(59, 47, 42, 0.3)',
          '@media print': { display: 'none' },
        }}
      >
        <NavToolbar>
          <Brand to={isAdmin ? '/admin' : '/trips'}>
            <ExploreOutlinedIcon fontSize="large" />
            Dziennik Podróży
          </Brand>

          {isAdmin ? (
            <Button color="inherit" component={NavLink} to="/admin" sx={navButtonSx}>
              Administracja
            </Button>
          ) : (
            <>
              <Button color="inherit" component={NavLink} to="/trips" sx={navButtonSx}>
                Moje podróże
              </Button>

              <Button color="inherit" component={NavLink} to="/wishlist" sx={navButtonSx}>
                Chcę zobaczyć
              </Button>

              <Button color="inherit" component={NavLink} to="/stats" sx={navButtonSx}>
                Statystyki
              </Button>
            </>
          )}

          <Button
            color="inherit"
            onClick={handleOpenMenu}
            aria-haspopup="menu"
            aria-expanded={Boolean(menuAnchor)}
            startIcon={
              <UserAvatar src={getFileUrl(profile?.avatarUrl ?? null)}>
                {userName?.charAt(0).toUpperCase()}
              </UserAvatar>
            }
            endIcon={<KeyboardArrowDownIcon />}
            sx={{ borderRadius: 999 }}
          >
            {userName}
          </Button>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
            {!isAdmin && (
              <MenuItem component={Link} to="/profile" onClick={handleCloseMenu}>
                <ListItemIcon>
                  <PersonOutlineOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Mój profil
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                handleCloseMenu()
                setChangingPassword(true)
              }}
            >
              <ListItemIcon>
                <LockOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Zmień hasło
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu()
                logout()
              }}
            >
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Wyloguj
            </MenuItem>
          </Menu>
        </NavToolbar>
      </AppBar>

      <Outlet />

      <ScrollRestoration />
      {changingPassword && <ChangePasswordDialog onClose={() => setChangingPassword(false)} />}
    </>
  )
}