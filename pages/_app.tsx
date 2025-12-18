import "../styles/globals.css";
import { Roboto } from "next/font/google";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Analytics } from "@vercel/analytics/react";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00D4AA",
      light: "#00F5C4",
      dark: "#00B392",
    },
    secondary: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
    },
    background: {
      default: "#000000",
      paper: "#0A0A0A",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#6B7280",
    },
    error: {
      main: "#EF4444",
    },
    success: {
      main: "#10B981",
    },
    warning: {
      main: "#F59E0B",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
      styleOverrides: {
        paper: {
          backgroundColor: "rgba(10, 10, 15, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        },
      },
    },
    MuiModal: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(0, 212, 170, 0.05)",
              borderColor: "#00D4AA",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#0A0A0A",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#00D4AA",
        },
      },
    },
  },
});

export default function App({ Component, pageProps }) {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <main className={roboto.className}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
      <Analytics />
    </LocalizationProvider>
  );
}
