import { Search } from "@mui/icons-material";
import { Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";


interface AnalyzePathFormProps {
    path: string;
    loading: boolean;
    onPathChange: (newPath: string) => void;
    onAnalyze: () => void;
}

export function AnalyzePathForm({ path, loading, onPathChange, onAnalyze }: Readonly<AnalyzePathFormProps>) {
    return (
        <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
            <Typography variant="h6" color="text.secondary" mb={2}>Set the absolute path you want to analyze</Typography>
            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    label="Directory Path"
                    placeholder="C:\\Users\\..."
                    value={path}
                    onChange={(e) => onPathChange(e.target.value)}
                    size="small"
                />
                <Button
                    variant="contained"
                    onClick={onAnalyze}
                    disabled={loading || !path.trim()}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                    sx={{ whiteSpace: "nowrap", minWidth: 120 }}
                >
                    {loading ? "Analyzing..." : "Analyze"}
                </Button>
            </Box>
        </Paper>
    );
}