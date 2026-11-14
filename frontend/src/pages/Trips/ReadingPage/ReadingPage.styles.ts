import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export const ReadingContainer = styled(Box)({
  maxWidth: 1100,
  margin: '0 auto',
  padding: 24,
  printColorAdjust: 'exact',
  WebkitPrintColorAdjust: 'exact',
  '@media print': {
    maxWidth: 'none',
    padding: 0,
  },
})

export const ReadingToolbar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  '@media print': {
    display: 'none',
  },
})

export const ReadingCover = styled(Box)({
  height: 340,
  marginTop: 16,
  borderRadius: 16,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 2px 8px rgba(59, 47, 42, 0.15)',
  '@media print': {
    height: 240,
    marginTop: 0,
    boxShadow: 'none',
  },
})

export const ReadingHeader = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: '32px 0 8px',
  textAlign: 'center',
})

export const ReadingDaySection = styled('section')({
  marginTop: 64,
  '@media print': {
    marginTop: 40,
  },
})

export const ReadingDayHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  marginBottom: 32,
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: 1,
    backgroundColor: '#D9C9AE',
  },
  '@media print': {
    breakAfter: 'avoid',
  },
})

export const ReadingStopRoot = styled('article')({
  '&:not(:last-of-type)': {
    marginBottom: 32,
    paddingBottom: 32,
    borderBottom: '1px dashed #D9C9AE',
  },
  '@media print': {
    breakInside: 'avoid',
  },
})

export const ReadingStopTitle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 12,
})

export const ReadingStopHeading = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
})

export const ReadingNote = styled('div')(({ theme }) => ({
  maxWidth: '75ch',
  '& > div': {
    ...theme.typography.body1,
    color: theme.palette.text.primary,
    lineHeight: 1.8,
  },
}))

export const ReadingPhotoGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 12,
  marginTop: 16,
  '@media print': {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    marginTop: 12,
  },
})

export const ReadingPhoto = styled('img')({
  display: 'block',
  width: '100%',
  aspectRatio: '4 / 3',
  objectFit: 'cover',
  borderRadius: 8,
  cursor: 'pointer',
  '@media print': {
    breakInside: 'avoid',
  },
})

export const ReadingRecordings = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  marginTop: 16,
  '@media print': {
    display: 'none',
  },
})

export const ReadingDayNote = styled(Typography)(({ theme }) => ({
  maxWidth: '75ch',
  margin: '-16px auto 32px',
  textAlign: 'center',
  fontStyle: 'italic',
  color: theme.palette.text.secondary,
  whiteSpace: 'pre-wrap',
}))

export const ReadingNextTime = styled(Typography)({
  maxWidth: '75ch',
  margin: '0 auto',
  whiteSpace: 'pre-wrap',
})