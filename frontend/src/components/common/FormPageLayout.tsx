import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { FormCard, FormPageContainer } from './FormPageLayout.styles'

interface FormPageLayoutProps {
  title: string
  backTo: string
  backLabel: string
  children: ReactNode
}

export function FormPageLayout({ title, backTo, backLabel, children }: FormPageLayoutProps) {
  return (
    <FormPageContainer>
      <Button component={Link} to={backTo}>
        {backLabel}
      </Button>

      <FormCard>
        <Typography variant="h4" component="h1" sx={{ marginBottom: 3 }}>
          {title}
        </Typography>

        {children}
      </FormCard>
    </FormPageContainer>
  )
}