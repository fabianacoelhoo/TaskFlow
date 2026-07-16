import { createTheme, alpha } from '@mui/material/styles';

// Paleta assinatura do TaskFlow: tinta naval profunda + dourado envelhecido
// sobre um fundo marfim, buscando o tom de um produto financeiro premium.
export const palette = {
  ink: '#0F1C2E',
  inkLight: '#16273E',
  navy: '#1B2B47',
  gold: '#B08D4F',
  goldLight: '#D8BE8A',
  ivory: '#F8F6F1',
  paper: '#FFFFFF',
  slate: '#5B6472',
  slateLight: '#8B93A1',
  line: 'rgba(15, 28, 46, 0.08)',
  success: '#2E7D5B',
  warning: '#B7791F',
  danger: '#B3441E',
};

declare module '@mui/material/styles' {
  interface Palette {
    accentGold: Palette['primary'];
  }
  interface PaletteOptions {
    accentGold?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.ink,
      light: palette.navy,
      dark: '#08111C',
      contrastText: palette.ivory,
    },
    accentGold: {
      main: palette.gold,
      light: palette.goldLight,
      dark: '#8C6C36',
      contrastText: palette.ink,
    },
    secondary: {
      main: palette.gold,
      contrastText: palette.ink,
    },
    success: { main: palette.success },
    warning: { main: palette.warning },
    error: { main: palette.danger },
    background: {
      default: palette.ivory,
      paper: palette.paper,
    },
    text: {
      primary: palette.ink,
      secondary: palette.slate,
    },
    divider: palette.line,
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Fraunces", "Georgia", serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontFamily: '"Fraunces", "Georgia", serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"Fraunces", "Georgia", serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", "Georgia", serif', fontWeight: 600 },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.005em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: palette.slate },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    body2: { color: palette.slate },
    overline: { letterSpacing: '0.12em', fontWeight: 700 },
  },
  shadows: [
    'none',
    '0 1px 2px rgba(15,28,46,0.04)',
    '0 2px 8px rgba(15,28,46,0.05)',
    '0 4px 12px rgba(15,28,46,0.06)',
    '0 6px 16px rgba(15,28,46,0.07)',
    '0 8px 20px rgba(15,28,46,0.08)',
    '0 10px 24px rgba(15,28,46,0.08)',
    '0 12px 28px rgba(15,28,46,0.09)',
    '0 14px 32px rgba(15,28,46,0.09)',
    '0 16px 36px rgba(15,28,46,0.10)',
    '0 18px 40px rgba(15,28,46,0.10)',
    '0 20px 44px rgba(15,28,46,0.10)',
    '0 22px 48px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
    '0 24px 52px rgba(15,28,46,0.10)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.ivory,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: {
          borderColor: palette.line,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 20,
          paddingBlock: 10,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(15,28,46,0.18)',
          },
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
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: palette.paper,
        },
        notchedOutline: {
          borderColor: palette.line,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${palette.line}`,
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${palette.line}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: palette.slate,
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: '0.06em',
          borderBottom: `1px solid ${palette.line}`,
        },
        root: {
          borderBottom: `1px solid ${palette.line}`,
        },
      },
    },
  },
});

export const goldAlpha = (opacity: number) => alpha(palette.gold, opacity);
export const inkAlpha = (opacity: number) => alpha(palette.ink, opacity);

export default theme;
