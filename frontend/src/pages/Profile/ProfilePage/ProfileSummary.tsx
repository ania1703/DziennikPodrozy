import type { ChangeEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { getFileUrl } from '../../../api/fileUrl'
import type { Profile } from '../../../api/useProfile'
import { useUploadAvatar } from '../../../api/useUploadAvatar'
import { VisuallyHiddenInput } from '../../Trips/TripDetailsPage/TripDetailsPage.styles'
import { ProfileAvatar, ProfileHeader } from './ProfilePage.styles'

interface ProfileSummaryProps {
  profile: Profile
}

function ProfileSummary({ profile }: ProfileSummaryProps) {
  const uploadAvatar = useUploadAvatar()
  const buttonLabel = profile.avatarUrl ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      uploadAvatar.mutate(file)
    }

    event.target.value = ''
  }

  return (
    <ProfileHeader>
      <ProfileAvatar src={getFileUrl(profile.avatarUrl)}>
        {profile.userName.charAt(0).toUpperCase()}
      </ProfileAvatar>

      <div>
        <Typography variant="h6">{profile.userName}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {profile.email}
        </Typography>

        <Button
          component="label"
          variant="outlined"
          size="small"
          sx={{ marginTop: 1 }}
          disabled={uploadAvatar.isPending}
        >
          {uploadAvatar.isPending ? 'Wgrywanie...' : buttonLabel}
          <VisuallyHiddenInput
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleChange}
          />
        </Button>

        {uploadAvatar.isError && (
          <Alert severity="error" sx={{ marginTop: 1 }}>
            Nie udało się wgrać zdjęcia. Dozwolone są pliki JPG i PNG do 2 MB.
          </Alert>
        )}
      </div>
    </ProfileHeader>
  )
}

export default ProfileSummary