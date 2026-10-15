import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { AuthPage, BrandMap, BrandPanel, FormPanel } from './AuthLayout.styles'
import worldMap from '../../assets/world-map.svg'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthPage>
      <BrandPanel>
        <Typography variant="h3" component="p">
          Dziennik Podróży
        </Typography>

        <Typography variant="h6" component="p" sx={{ marginTop: 2, opacity: 0.85 }}>
          Zapisz drogę, nie tylko cel.
        </Typography>

        <BrandMap src={worldMap} alt="" />
      </BrandPanel>

      <FormPanel>{children}</FormPanel>
    </AuthPage>
  )
}