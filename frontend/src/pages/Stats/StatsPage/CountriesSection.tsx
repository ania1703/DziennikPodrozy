import Typography from '@mui/material/Typography'
import { getCountryName } from '../../../utils/countries'
import { Flag, FlagCard, FlagGrid, SectionCard } from './StatsPage.styles'

interface CountriesSectionProps {
  codes: string[]
}

function CountriesSection({ codes }: CountriesSectionProps) {
  const sorted = [...codes].sort((a, b) =>
    getCountryName(a).localeCompare(getCountryName(b), 'pl'),
  )

  return (
    <SectionCard>
      <Typography variant="h6" component="h2">
        Odwiedzone kraje ({codes.length})
      </Typography>

      {sorted.length === 0 ? (
        <Typography variant="body2" sx={{ marginTop: 1, color: 'text.secondary' }}>
          Gdy dodasz przystanki w odbytych podróżach, pojawią się tu flagi odwiedzonych
          krajów.
        </Typography>
      ) : (
        <FlagGrid>
          {sorted.map((code) => (
            <FlagCard key={code}>
              <Flag className={`fi fi-${code.toLowerCase()}`} />
              <Typography variant="body2">{getCountryName(code)}</Typography>
            </FlagCard>
          ))}
        </FlagGrid>
      )}
    </SectionCard>
  )
}

export default CountriesSection