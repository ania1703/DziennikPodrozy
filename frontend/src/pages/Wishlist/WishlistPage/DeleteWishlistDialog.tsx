import { useDeleteWishlistItem } from '../../../api/useDeleteWishlistItem'
import type { WishlistItem } from '../../../api/useWishlist'
import { ConfirmDeleteDialog } from '../../../components/common/ConfirmDeleteDialog'

interface DeleteWishlistDialogProps {
  item: WishlistItem
  onClose: () => void
}

function DeleteWishlistDialog({ item, onClose }: DeleteWishlistDialogProps) {
  const deleteItem = useDeleteWishlistItem(item.id)

  return (
    <ConfirmDeleteDialog
      open
      title="Usunąć miejsce?"
      description={`Miejsce „${item.title}” zniknie z Twojej listy. Tej operacji nie można cofnąć.`}
      isPending={deleteItem.isPending}
      isError={deleteItem.isError}
      onConfirm={() => deleteItem.mutate(undefined, { onSuccess: onClose })}
      onClose={onClose}
    />
  )
}

export default DeleteWishlistDialog