import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#7F4A33' },
    secondary: { main: '#5B7B6F' },
    success: { main: '#5E8A63' },
    warning: { main: '#D9A441' },
    background: { default: '#FAF5EC', paper: '#FFFDF8' },
    text: { primary: '#3B2F2A', secondary: '#6F5E55' },
  },
  typography: {
    fontFamily: '"Lora Variable", Georgia, serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
    components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
})