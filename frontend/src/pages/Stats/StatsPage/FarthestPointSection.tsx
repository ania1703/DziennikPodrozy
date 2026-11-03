import { Link } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { Stats } from '../../../api/useStats'
import { getCountryName } from '../../../utils/countries'
import { SectionCard } from './StatsPage.styles'
import MuiLink from '@mui/material/Link'
import AnimatedNumber from './AnimatedNumber'

interface FarthestPointSectionProps {
  stats: Stats
}

function FarthestPointSection({ stats }: FarthestPointSectionProps) {
  const { farthestPoint, hasHome, homeCity } = stats

  return (
    <SectionCard sx={{ marginTop: 3 }}>
      <Typography variant="h6" component="h2">
        Najdalszy punkt od domu
      </Typography>

      {!hasHome && (
        <Alert
          severity="info"
          sx={{ marginTop: 2 }}
          action={
            <Button color="inherit" size="small" component={Link} to="/profile">
              Profil
            </Button>
          }
        >
          Wybierz miasto domowe w profilu, a policzymy, jak daleko zawędrowano.
        </Alert>
      )}

      {hasHome && !farthestPoint && (
        <Typography variant="body2" sx={{ marginTop: 1, color: 'text.secondary' }}>
          Nie ma jeszcze przystanków w odbytych podróżach.
        </Typography>
      )}

      {hasHome && farthestPoint && (
        <div>
          <Typography variant="h4" component="p" sx={{ marginTop: 2, color: 'primary.main' }}>
            <AnimatedNumber value={farthestPoint.distanceKm} /> km
          </Typography>

          <Typography sx={{ marginTop: 1 }}>
            <MuiLink component={Link} to={`/trips/${farthestPoint.tripId}`}>
              {farthestPoint.title}
            </MuiLink>
            {farthestPoint.countryCode && (
              <>
                {' · '}
                <span className={`fi fi-${farthestPoint.countryCode.toLowerCase()}`} />{' '}
                {getCountryName(farthestPoint.countryCode)}
              </>
            )}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            w linii prostej od miasta domowego ({homeCity})
          </Typography>
        </div>
      )}
    </SectionCard>
  )
}

export default FarthestPointSection