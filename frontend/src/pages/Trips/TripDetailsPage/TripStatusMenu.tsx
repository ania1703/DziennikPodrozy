import { useState, type ReactNode } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useChangeTripStatus } from '../../../api/useChangeTripStatus'
import { useSetTripDescribed } from '../../../api/useSetTripDescribed'
import type { Trip, TripStatus } from '../../../api/useTrips'

interface TripStatusMenuProps {
  trip: Trip
}

function TripStatusMenu({ trip }: TripStatusMenuProps) {
  const changeStatus = useChangeTripStatus(trip.id)
  const setDescribed = useSetTripDescribed(trip.id)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [confirming, setConfirming] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const endedInPast = trip.endDate !== null && trip.endDate < today
  const pending = changeStatus.isPending || setDescribed.isPending

  function handleStatus(status: TripStatus) {
    setAnchor(null)
    changeStatus.mutate(status)
  }

  const items: ReactNode[] = []

  if (trip.status === 'Planned' || trip.status === 'InProgress') {
    items.push(
      <MenuItem key="finish" onClick={() => handleStatus('Finished')}>
        Oznacz jako zakończoną
      </MenuItem>,
    )
  }

  if (trip.status === 'InProgress') {
    items.push(
      <MenuItem key="planned" onClick={() => handleStatus('Planned')}>
        Wróć do zaplanowanej
      </MenuItem>,
    )
  }

  if (trip.status === 'Finished') {
    items.push(
      trip.isDescribed ? (
        <MenuItem
          key="described"
          onClick={() => {
            setAnchor(null)
            setDescribed.mutate(false)
          }}
        >
          Wznów edycję dziennika
        </MenuItem>
      ) : (
        <MenuItem
          key="described"
          onClick={() => {
            setAnchor(null)
            setConfirming(true)
          }}
        >
          Oznacz jako opisaną
        </MenuItem>
      ),
    )

    items.push(
      <MenuItem key="resume" disabled={endedInPast} onClick={() => handleStatus('InProgress')}>
        <ListItemText
          primary="Wznów podróż"
          secondary={endedInPast ? 'Zmień datę zakończenia w „Edytuj podróż”' : undefined}
        />
      </MenuItem>,
    )
  }

  return (
    <>
      {(changeStatus.isError || setDescribed.isError) && (
        <Alert severity="error">Nie udało się zmienić statusu.</Alert>
      )}

      {trip.status === 'Planned' && (
        <Button
          variant="contained"
          disabled={pending}
          onClick={() => changeStatus.mutate('InProgress')}
        >
          Rozpocznij podróż
        </Button>
      )}

      <Button
        variant="outlined"
        disabled={pending}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Zmień status
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {items}
      </Menu>

      <Dialog open={confirming} onClose={() => setConfirming(false)}>
        <DialogTitle>Dziennik gotowy?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Podróż dostanie znaczek „Opisana”. Dalej możesz edytować wpisy, a znaczek w każdej
            chwili da się zdjąć przez „Wznów edycję dziennika”.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirming(false)}>Anuluj</Button>

          <Button
            variant="contained"
            disabled={setDescribed.isPending}
            onClick={() =>
              setDescribed.mutate(true, { onSuccess: () => setConfirming(false) })
            }
          >
            {setDescribed.isPending ? 'Zapisywanie...' : 'Tak, opisana'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TripStatusMenu