import { useState } from 'react'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useExportTrip, type ExportFormat } from '../../../api/useExportTrip'
import type { Trip } from '../../../api/useTrips'

interface ExportActionProps {
  trip: Trip
}

function ExportAction({ trip }: ExportActionProps) {
  const exportTrip = useExportTrip(trip.id, trip.title)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  function handleExport(format: ExportFormat) {
    setAnchor(null)
    exportTrip.mutate(format)
  }

  return (
    <div>
      <Button
        variant="outlined"
        disabled={exportTrip.isPending}
        startIcon={<DownloadOutlinedIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {exportTrip.isPending ? 'Pobieranie...' : 'Pobierz dane'}
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => handleExport('txt')}>
          <ListItemText
            primary="Plik tekstowy (.txt)"
            secondary="Czytelny, bez formatowania"
          />
        </MenuItem>

        <MenuItem onClick={() => handleExport('json')}>
          <ListItemText
            primary="Plik JSON (.json)"
            secondary="Do wczytania w innej aplikacji"
          />
        </MenuItem>

        <MenuItem onClick={() => handleExport('zip')}>
          <ListItemText
            primary="Pełny eksport (.zip)"
            secondary="Dane oraz zdjęcia i nagrania"
          />
        </MenuItem>
      </Menu>

      {exportTrip.isError && (
        <Alert severity="error" sx={{ marginTop: 1 }}>
          Nie udało się pobrać danych.
        </Alert>
      )}
    </div>
  )
}

export default ExportAction