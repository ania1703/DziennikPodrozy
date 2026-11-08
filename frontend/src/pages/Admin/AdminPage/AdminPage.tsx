import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useAdminUsers } from '../../../api/useAdminUsers'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { daysSince } from '../../../utils/formatActivity'
import AdminUserRow from './AdminUserRow'
import { AdminContainer, SummaryGrid, SummaryTile, TableCard } from './AdminPage.styles'

function AdminPage() {
  const { data: users, isLoading, isError } = useAdminUsers()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !users) {
    return <Alert severity="error">Nie udało się wczytać użytkowników.</Alert>
  }

  const summary = [
    { label: 'Użytkownicy', value: users.length },
    {
      label: 'Aktywni w ostatnich 7 dniach',
      value: users.filter((user) => user.lastActiveAt && daysSince(user.lastActiveAt) <= 7)
        .length,
    },
    {
      label: 'Nowi w ostatnich 30 dniach',
      value: users.filter((user) => daysSince(user.createdAt) <= 30).length,
    },
    { label: 'Zawieszeni', value: users.filter((user) => user.isSuspended).length },
  ]

  return (
    <AdminContainer>
      <Typography variant="h4" component="h1">
        Administracja
      </Typography>

      <Typography variant="body2" sx={{ marginTop: 1, color: 'text.secondary' }}>
        Przegląd użytkowników, ich aktywności oraz zawieszanie i usuwanie kont.
      </Typography>

      <SummaryGrid>
        {summary.map((item) => (
          <SummaryTile key={item.label}>
            <Typography
              variant="h4"
              component="p"
              sx={{ color: 'primary.main', fontWeight: 700 }}
            >
              {item.value}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>
          </SummaryTile>
        ))}
      </SummaryGrid>

      <TableCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Użytkownik</TableCell>
                <TableCell>Konto założone</TableCell>
                <TableCell>Ostatnia aktywność</TableCell>
                <TableCell align="right">Podróże</TableCell>
                <TableCell align="right">Przystanki</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <AdminUserRow key={user.id} user={user} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TableCard>
    </AdminContainer>
  )
}

export default AdminPage