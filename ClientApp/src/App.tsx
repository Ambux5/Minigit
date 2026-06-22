import React from "react";
import { AnalyzeResult } from "./types/minigit";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { darkTheme } from "./theme/darkTheme";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container/Container";
import { AnalyzePathForm } from "./components/AnalyzePathForm";
import { Alert } from "@mui/material";
import { AnalyzeResults } from "./components/AnalyzeResults";
import { apiService } from "./services/api.service";

export default function MiniGitApplication() {
  const [path, setPath] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [analyzeResult, setAnalyzeResult] = React.useState<AnalyzeResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const analyzeDirectory = async () => {
    if (!path.trim()) {
      console.log("Please enter a valid directory path.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalyzeResult(null);
    try {
      const result = await apiService.analyzeDirectory(path);
      setAnalyzeResult(result);
    } catch (err: unknown) {
      console.error('Analyze error:', err);
      setError("An error occurred while analyzing the directory.");
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
        <AnalyzePathForm
          path={path}
          loading={loading}
          onPathChange={setPath}
          onAnalyze={analyzeDirectory}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {analyzeResult && <AnalyzeResults analyzeResult={analyzeResult} />}
      </Container>
    </ThemeProvider>
  );
}

