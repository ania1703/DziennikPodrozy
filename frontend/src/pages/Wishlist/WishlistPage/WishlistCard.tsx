import { useState } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { WishlistItem } from '../../../api/useWishlist'
import { getCountryName } from '../../../utils/countries'
import { formatDateRange } from '../../../utils/formatDate'
import DeleteWishlistDialog from './DeleteWishlistDialog'
import EditWishlistDialog from './EditWishlistDialog'
import {
  WishlistCardFooter,
  WishlistCardHeader,
  WishlistCardRoot,
  WishlistFlag,
  WishlistNote,
} from './WishlistPage.styles'

interface WishlistCardProps {
  item: WishlistItem
}

function WishlistCard({ item }: WishlistCardProps) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <WishlistCardRoot>
      <WishlistCardHeader>
        {item.countryCode && (
          <WishlistFlag className={`fi fi-${item.countryCode.toLowerCase()}`} />
        )}

        <div>
          <Typography variant="h6" component="h2">
            {item.title}
          </Typography>

          {item.countryCode && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {getCountryName(item.countryCode)}
            </Typography>
          )}
        </div>
      </WishlistCardHeader>

      {item.note && <WishlistNote>„{item.note}”</WishlistNote>}

      <WishlistCardFooter>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Dodano {formatDateRange(item.addedOn, null)}
        </Typography>

        <div>
          <Button size="small" onClick={() => setEditing(true)}>
            Edytuj
          </Button>

          <Button size="small" color="error" onClick={() => setDeleting(true)}>
            Usuń
          </Button>
        </div>
      </WishlistCardFooter>

      {editing && <EditWishlistDialog item={item} onClose={() => setEditing(false)} />}
      {deleting && <DeleteWishlistDialog item={item} onClose={() => setDeleting(false)} />}
    </WishlistCardRoot>
  )
}

export default WishlistCard