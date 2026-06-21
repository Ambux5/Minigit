import React from "react";
import { ScanResult } from "./types/minigit";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme } from "./theme/darkTheme";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container/Container";
import { ScanPathForm } from "./components/ScanPathForm";
import { Alert } from "@mui/material";
import { ScanResults } from "./components/ScanResults";
import { apiService } from "./services/api.service";

export default function MiniGitApplication() {
  const [path, setPath] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const scanDirectory = async () => {
    if (!path.trim()) {
      console.log("Please enter a valid directory path.");
      return;
    }
    setLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const result = await apiService.scanDirectory(path);
      setScanResult(result);
    } catch (err: unknown) {
      console.error('Scan error:', err);
      setError("An error occurred while scanning the directory.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* -- appBar -- */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" color="primary" noWrap fontWeight={700}>
            MiniGit Application
          </Typography>
        </Toolbar>
      </AppBar>

      {/* -- main content -- */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ScanPathForm
          path={path}
          loading={loading}
          onPathChange={setPath}
          onScan={scanDirectory}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {scanResult && <ScanResults scanResult={scanResult} />}
      </Container>
    </ThemeProvider>
  );
}

