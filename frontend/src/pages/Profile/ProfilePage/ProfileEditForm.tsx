import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { PlaceResult } from '../../../api/usePlaceSearch'
import type { Profile } from '../../../api/useProfile'
import { useUpdateProfile } from '../../../api/useUpdateProfile'
import PlaceSearch from '../../Trips/TripDetailsPage/PlaceSearch'
import { HomeCitySection, ProfileFormRoot } from './ProfilePage.styles'

interface HomeLocation {
  city: string
  latitude: number
  longitude: number
}

interface ProfileEditFormProps {
  profile: Profile
}

function getInitialHome(profile: Profile): HomeLocation | null {
  if (profile.homeCity && profile.homeLatitude !== null && profile.homeLongitude !== null) {
    return {
      city: profile.homeCity,
      latitude: profile.homeLatitude,
      longitude: profile.homeLongitude,
    }
  }

  return null
}

function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const updateProfile = useUpdateProfile()
  const [bio, setBio] = useState(profile.bio ?? '')
  const [home, setHome] = useState<HomeLocation | null>(getInitialHome(profile))
  const [searchKey, setSearchKey] = useState(0)
  const [changingHome, setChangingHome] = useState(false)

  function handleSelectPlace(place: PlaceResult) {
    updateProfile.reset()
    setHome({ city: place.name, latitude: place.latitude, longitude: place.longitude })
    setSearchKey((key) => key + 1)
    setChangingHome(false)
  }

  function handleSave() {
    updateProfile.mutate({
      bio: bio.trim() || null,
      homeCity: home?.city ?? null,
      homeLatitude: home?.latitude ?? null,
      homeLongitude: home?.longitude ?? null,
    })
  }

  return (
    <ProfileFormRoot>
      {updateProfile.isError && (
        <Alert severity="error">Nie udało się zapisać profilu.</Alert>
      )}

      {updateProfile.isSuccess && <Alert severity="success">Profil zapisany.</Alert>}

      <TextField
        label="O mnie"
        value={bio}
        onChange={(event) => {
          updateProfile.reset()
          setBio(event.target.value)
        }}
        multiline
        minRows={3}
        slotProps={{ htmlInput: { maxLength: 500 } }}
        helperText={`${bio.length}/500`}
      />

      <HomeCitySection>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Miasto domowe
        </Typography>

        {home && !changingHome ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Chip
              label={home.city}
              onDelete={() => {
                updateProfile.reset()
                setHome(null)
              }}
            />

            <Button size="small" onClick={() => setChangingHome(true)}>
              Zmień
            </Button>
          </div>
        ) : (
          <>
            {!home && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nie wybrano. Podaj miasto, a w statystykach policzymy, jak daleko od domu
                zawędrowano.
              </Typography>
            )}

            <PlaceSearch
              key={searchKey}
              label="Szukaj miasta (np. Warszawa)"
              onSelect={handleSelectPlace}
            />

            {home && (
              <div>
                <Button size="small" onClick={() => setChangingHome(false)}>
                  Anuluj
                </Button>
              </div>
            )}
          </>
        )}
      </HomeCitySection>

      <div>
        <Button variant="contained" onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Zapisywanie...' : 'Zapisz profil'}
        </Button>
      </div>
    </ProfileFormRoot>
  )
}

export default ProfileEditForm