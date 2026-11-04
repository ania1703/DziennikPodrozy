import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useWishlist } from '../../../api/useWishlist'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import AddWishlistDialog from './AddWishlistDialog'
import WishlistCard from './WishlistCard'
import {
  EmptyWishlist,
  WishlistContainer,
  WishlistGrid,
  WishlistHeader,
} from './WishlistPage.styles'

function WishlistPage() {
  const { data: items, isLoading, isError } = useWishlist()
  const [adding, setAdding] = useState(false)

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !items) {
    return <Alert severity="error">Nie udało się wczytać listy miejsc.</Alert>
  }

  return (
    <WishlistContainer>
      <WishlistHeader>
        <div>
          <Typography variant="h4" component="h1">
            Chcę zobaczyć
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Miejsca, do których kiedyś chcesz pojechać, i dlaczego.
          </Typography>
        </div>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAdding(true)}>
          Dodaj miejsce
        </Button>
      </WishlistHeader>

      {items.length === 0 ? (
        <EmptyWishlist>
          <Typography variant="h6" component="p">
            Tu trafią miejsca, które chcesz kiedyś zobaczyć.
          </Typography>

          <Button variant="contained" onClick={() => setAdding(true)}>
            Dodaj pierwsze miejsce
          </Button>
        </EmptyWishlist>
      ) : (
        <WishlistGrid>
          {items.map((item) => (
            <WishlistCard key={item.id} item={item} />
          ))}
        </WishlistGrid>
      )}

      {adding && <AddWishlistDialog onClose={() => setAdding(false)} />}
    </WishlistContainer>
  )
}

export default WishlistPage