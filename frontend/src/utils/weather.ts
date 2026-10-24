import type { SvgIconComponent } from '@mui/icons-material'
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import FoggyIcon from '@mui/icons-material/Foggy'
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined'
import UmbrellaOutlinedIcon from '@mui/icons-material/UmbrellaOutlined'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import WbCloudyOutlinedIcon from '@mui/icons-material/WbCloudyOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

interface WeatherInfo {
  Icon: SvgIconComponent
  label: string
}

export function getWeatherInfo(code: number): WeatherInfo {
  if (code === 0) return { Icon: WbSunnyOutlinedIcon, label: 'Bezchmurnie' }
  if (code === 1) return { Icon: WbSunnyOutlinedIcon, label: 'Głównie słonecznie' }
  if (code === 2) return { Icon: WbCloudyOutlinedIcon, label: 'Częściowe zachmurzenie' }
  if (code === 3) return { Icon: CloudOutlinedIcon, label: 'Pochmurno' }
  if (code === 45 || code === 48) return { Icon: FoggyIcon, label: 'Mgła' }
  if (code >= 51 && code <= 57) return { Icon: WaterDropOutlinedIcon, label: 'Mżawka' }
  if (code >= 61 && code <= 67) return { Icon: UmbrellaOutlinedIcon, label: 'Deszcz' }
  if (code >= 71 && code <= 77) return { Icon: AcUnitOutlinedIcon, label: 'Śnieg' }
  if (code >= 80 && code <= 82) return { Icon: UmbrellaOutlinedIcon, label: 'Przelotny deszcz' }
  if (code === 85 || code === 86) return { Icon: AcUnitOutlinedIcon, label: 'Przelotny śnieg' }
  if (code >= 95) return { Icon: ThunderstormOutlinedIcon, label: 'Burza' }

  return { Icon: CloudOutlinedIcon, label: 'Pogoda' }
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`
}