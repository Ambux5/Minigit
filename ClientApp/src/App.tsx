import * as React from "react";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";

const theme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides:{
        root:{
          "border-bottom": '0px'
        } 
      }
    },
  },
});

export default function MiniGitApplication() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Mini Git Application
          </Typography>
        </Toolbar>
      </AppBar>

    </ThemeProvider>
  );
}
