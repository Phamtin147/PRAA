import { createTheme } from '@mui/material/styles';

const commonTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          boxShadow: '0 4px 14px 0 rgba(103, 80, 164, 0.35)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(103, 80, 164, 0.45)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6750A4',
              },
            },
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4',
      light: '#9A82DB',
      dark: '#4A3780',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00BFA5',
      light: '#5DF2D6',
      dark: '#008E76',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F3FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#625B71',
    },
    error: {
      main: '#F44336',
      light: '#FFE4E2',
    },
    warning: {
      main: '#FF9800',
      light: '#FFF3E0',
    },
    success: {
      main: '#4CAF50',
      light: '#E8F5E9',
    },
    info: {
      main: '#2196F3',
      light: '#E3F2FD',
    },
    divider: 'rgba(103, 80, 164, 0.12)',
  },
});

export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#D0BCFF',
      light: '#EADDFF',
      dark: '#9A82DB',
      contrastText: '#1C1B1F',
    },
    secondary: {
      main: '#00BFA5',
      light: '#5DF2D6',
      dark: '#008E76',
      contrastText: '#1C1B1F',
    },
    background: {
      default: '#141218',
      paper: '#1E1B24',
    },
    text: {
      primary: '#E6E1E5',
      secondary: '#CAC4D0',
    },
    error: {
      main: '#F44336',
      light: '#4A1C1A',
    },
    warning: {
      main: '#FF9800',
      light: '#3A2A00',
    },
    success: {
      main: '#4CAF50',
      light: '#1B3A1E',
    },
    info: {
      main: '#64B5F6',
      light: '#1A2A3A',
    },
    divider: 'rgba(208, 188, 255, 0.12)',
  },
});
