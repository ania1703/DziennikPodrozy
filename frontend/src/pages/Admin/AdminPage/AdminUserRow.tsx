import { useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { getErrorMessage } from '../../../api/getErrorMessage'
import { getFileUrl } from '../../../api/fileUrl'
import { useAdminUserAction } from '../../../api/useAdminUserAction'
import type { AdminUser } from '../../../api/useAdminUsers'
import { daysSince, formatDay, formatLastActive } from '../../../utils/formatActivity'
import { UserCell } from './AdminPage.styles'
import ConfirmActionDialog from './ConfirmActionDialog'

type DialogKind = 'suspend' | 'request-deletion' | 'delete'

interface AdminUserRowProps {
  user: AdminUser
}

function AdminUserRow({ user }: AdminUserRowProps) {
  const suspend = useAdminUserAction('suspend')
  const unsuspend = useAdminUserAction('unsuspend')
  const requestDeletion = useAdminUserAction('request-deletion')
  const deleteUser = useAdminUserAction('delete')
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [dialog, setDialog] = useState<DialogKind | null>(null)

  const mutations = {
    suspend,
    'request-deletion': requestDeletion,
    delete: deleteUser,
  }

  const dialogs = {
    suspend: {
      title: 'Zawiesić konto?',
      description: `Konto „${user.userName}” zostanie zawieszone. Użytkownik zostanie wylogowany i nie będzie mógł się zalogować. Jego dane zostają, a zawieszenie można w każdej chwili cofnąć.`,
      confirmLabel: 'Zawieś',
      destructive: false,
    },
    'request-deletion': {
      title: 'Zaplanować usunięcie konta?',
      description: `Konto „${user.userName}” zostanie zawieszone i oznaczone do usunięcia. Na stałe będzie można je usunąć dopiero po tygodniu, a do tego czasu usunięcie można anulować.`,
      confirmLabel: 'Zaplanuj usunięcie',
      destructive: true,
    },
    delete: {
      title: 'Usunąć konto na stałe?',
      description: `Konto „${user.userName}” zostanie usunięte razem ze wszystkimi podróżami, przystankami, zdjęciami i nagraniami. Tej operacji nie można cofnąć.`,
      confirmLabel: 'Usuń na stałe',
      destructive: true,
    },
  }

  const activeMutation = dialog ? mutations[dialog] : null
  const canDelete = user.deletionAllowedAt !== null && daysSince(user.deletionAllowedAt) >= 0

  function openDialog(kind: DialogKind) {
    setAnchor(null)
    setDialog(kind)
  }

  function handleUnsuspend() {
    setAnchor(null)
    unsuspend.mutate(user.id)
  }

  function renderStatus() {
    if (user.isAdmin) {
      return <Chip size="small" variant="outlined" label="Administrator" />
    }

    if (user.deletionRequestedAt && user.deletionAllowedAt) {
      return (
        <Chip
          size="small"
          color="error"
          label={`Do usunięcia od ${formatDay(user.deletionAllowedAt)}`}
        />
      )
    }

    if (user.isSuspended) {
      return <Chip size="small" color="warning" label="Zawieszone" />
    }

    return <Chip size="small" color="success" label="Aktywne" />
  }

  const menuItems = []

  if (!user.isSuspended) {
    menuItems.push(
      <MenuItem key="suspend" onClick={() => openDialog('suspend')}>
        Zawieś konto
      </MenuItem>,
    )
  }

  if (user.isSuspended && !user.deletionRequestedAt) {
    menuItems.push(
      <MenuItem key="unsuspend" onClick={handleUnsuspend}>
        Odwieś konto
      </MenuItem>,
    )
  }

  if (!user.deletionRequestedAt) {
    menuItems.push(
      <MenuItem key="request-deletion" onClick={() => openDialog('request-deletion')}>
        Zaplanuj usunięcie
      </MenuItem>,
    )
  } else {
    menuItems.push(
      <MenuItem key="cancel-deletion" onClick={handleUnsuspend}>
        Anuluj usunięcie i odwieś konto
      </MenuItem>,
      <MenuItem key="delete" disabled={!canDelete} onClick={() => openDialog('delete')}>
        <ListItemText
          primary="Usuń na stałe"
          secondary={
            !canDelete && user.deletionAllowedAt
              ? `Dostępne od ${formatDay(user.deletionAllowedAt)}`
              : undefined
          }
        />
      </MenuItem>,
    )
  }

  return (
    <>
      <TableRow hover>
        <TableCell>
          <UserCell>
            <Avatar src={getFileUrl(user.avatarUrl)}>
              {user.userName.charAt(0).toUpperCase()}
            </Avatar>

            <div>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user.userName}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user.email}
              </Typography>
            </div>
          </UserCell>
        </TableCell>

        <TableCell>{formatDay(user.createdAt)}</TableCell>
        <TableCell>{formatLastActive(user.lastActiveAt)}</TableCell>
        <TableCell align="right">{user.tripCount}</TableCell>
        <TableCell align="right">{user.stopCount}</TableCell>

        <TableCell>
          {renderStatus()}

          {unsuspend.isError && (
            <Typography variant="caption" color="error" component="p">
              {getErrorMessage(unsuspend.error, 'Nie udało się odwiesić konta.')}
            </Typography>
          )}
        </TableCell>

        <TableCell align="right">
          {!user.isAdmin && (
            <>
              <IconButton
                aria-label="Akcje"
                size="small"
                onClick={(event) => setAnchor(event.currentTarget)}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                {menuItems}
              </Menu>
            </>
          )}
        </TableCell>
      </TableRow>

      {dialog && activeMutation && (
        <ConfirmActionDialog
          {...dialogs[dialog]}
          isPending={activeMutation.isPending}
          errorMessage={
            activeMutation.isError
              ? getErrorMessage(activeMutation.error, 'Nie udało się wykonać operacji.')
              : null
          }
          onConfirm={() => activeMutation.mutate(user.id, { onSuccess: () => setDialog(null) })}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  )
}

export default AdminUserRow