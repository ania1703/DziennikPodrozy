import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { usePlaceSearch, type PlaceResult } from '../../../api/usePlaceSearch'
import { PlaceResults, PlaceSearchForm } from './TripDetailsPage.styles'

interface PlaceSearchProps {
  onSelect: (place: PlaceResult) => void
}

function PlaceSearch({ onSelect }: PlaceSearchProps) {
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const { data: places, isFetching, isError } = usePlaceSearch(query)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setQuery(inputValue.trim())
  }

  return (
    <div>
      <PlaceSearchForm onSubmit={handleSubmit}>
        <TextField
          size="small"
          fullWidth
          label="Szukaj miejsca (np. Wawel, Kraków)"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isFetching || inputValue.trim().length < 3}
        >
          {isFetching ? 'Szukam...' : 'Szukaj'}
        </Button>
      </PlaceSearchForm>

      {isError && (
        <Alert severity="error" sx={{ marginTop: 1 }}>
          Nie udało się wyszukać miejsca. Spróbuj ponownie za chwilę.
        </Alert>
      )}

      {places && places.length === 0 && (
        <Typography sx={{ marginTop: 1, color: 'text.secondary' }}>
          Nie znaleziono takiego miejsca.
        </Typography>
      )}

      {places && places.length > 0 && (
        <PlaceResults>
          <List disablePadding>
            {places.map((place) => (
              <ListItemButton key={place.id} onClick={() => onSelect(place)}>
                <ListItemText primary={place.name} secondary={place.displayName} />
              </ListItemButton>
            ))}
          </List>
        </PlaceResults>
      )}
    </div>
  )
}

export default PlaceSearch