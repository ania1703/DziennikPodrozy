import Tooltip from '@mui/material/Tooltip'
import type { StopWeather } from '../../../api/useTripStops'
import { formatTemperature, getWeatherInfo } from '../../../utils/weather'
import { StopWeatherCompact } from './TripDetailsPage.styles'

interface WeatherSummaryProps {
  weather: StopWeather
}

function WeatherSummary({ weather }: WeatherSummaryProps) {
  const { Icon, label } = getWeatherInfo(weather.weatherCode)

  return (
    <Tooltip
      title={
        <div>
          <strong>{label}</strong>
          <div>
            Maks. {formatTemperature(weather.temperatureMax)}, min.{' '}
            {formatTemperature(weather.temperatureMin)}
          </div>
          {weather.precipitationMm > 0 && (
            <div>
              Opad{' '}
              {weather.precipitationMm.toLocaleString('pl-PL', { maximumFractionDigits: 1 })} mm
            </div>
          )}
        </div>
      }
    >
      <StopWeatherCompact>
        <Icon fontSize="small" />
        {formatTemperature(weather.temperatureMax)}
      </StopWeatherCompact>
    </Tooltip>
  )
}

export default WeatherSummary