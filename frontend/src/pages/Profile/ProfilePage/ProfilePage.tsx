import Alert from '@mui/material/Alert'
import { useProfile } from '../../../api/useProfile'
import { FormPageLayout } from '../../../components/common/FormPageLayout'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import ProfileEditForm from './ProfileEditForm'
import ProfileSummary from './ProfileSummary'

function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !profile) {
    return <Alert severity="error">Nie udało się wczytać profilu.</Alert>
  }

  return (
    <FormPageLayout title="Mój profil" backTo="/trips" backLabel="← Wróć do podróży">
      <ProfileSummary profile={profile} />
      <ProfileEditForm profile={profile} />
    </FormPageLayout>
  )
}

export default ProfilePage