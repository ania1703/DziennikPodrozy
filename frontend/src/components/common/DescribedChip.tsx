import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import Chip from '@mui/material/Chip'

interface DescribedChipProps {
  size?: 'small' | 'medium'
}

export function DescribedChip({ size = 'small' }: DescribedChipProps) {
  return (
    <Chip
      icon={<CheckCircleOutlineOutlinedIcon />}
      label="Opisana"
      size={size}
      sx={{
        alignSelf: 'flex-start',
        backgroundColor: '#FFFDF8',
        color: 'text.primary',
        border: '1px solid #EADFCB',
        '& .MuiChip-icon': { color: 'success.main' },
      }}
    />
  )
}