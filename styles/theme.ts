import { PaletteOptions, ZIndex, createTheme } from '@mui/material/styles';

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    cardTitle: true;
  }
}

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: () => ({
        body: {
          overflowX: 'hidden',
        }
      }),
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          marginTop: '.5rem',
          boxShadow: 'none',
          border: '1px solid #ccc',
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: 'cardTitle' },
          style: {
            fontSize: '1.2rem',
            lineHeight: '1.3',
            fontWeight: 'bold',
            marginBottom: 0,
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '.2rem',
          '&:hover': {
            background: '#ffce6e',
          }
        },
      },
    },
  },
  palette: {
    background: {
      default: "#ecf2eb",
    },
    primary: {
      main: "#000",
    },
    secondary: {
      main: "#3035a4",
    },
    highlight: {
      main: "#ffce6e",
    },
  } as PaletteOptions,
  zIndex: {
    keyVisual: -1,
    navBar: 1000,
  } as Partial<ZIndex>,
});

export default theme;
