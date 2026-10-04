import CircularProgress from '@mui/material/CircularProgress'
import { SpinnerWrapper } from './LoadingSpinner.styles'

export function LoadingSpinner() {
  return (
    <SpinnerWrapper>
      <CircularProgress />
    </SpinnerWrapper>
  )
}