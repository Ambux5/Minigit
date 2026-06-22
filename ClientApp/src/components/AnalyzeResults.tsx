import React from 'react';
import { AnalyzeResult } from '../types/minigit';
import Box from '@mui/material/Box/Box';
import Typography from '@mui/material/Typography/Typography';
import { Alert, Chip, Divider, List, Paper } from '@mui/material';
import { Folder } from '@mui/icons-material';
import { EntryItem } from './EntryItem';
import { DiffSection } from './DiffSection';

interface AnalyzeResultsProps {
    analyzeResult: AnalyzeResult;
}

export function AnalyzeResults({ analyzeResult }: Readonly<AnalyzeResultsProps>) {
    return (
        <>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">Analyze Results</Typography>
                {analyzeResult.isFirstRun ? (
                    <Typography variant="body2" color="info">(First Analysis)</Typography>
                ) : (
                    <Typography variant="body2" color="textSecondary">(Differences)</Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                    {new Date(analyzeResult.analyzedAt).toLocaleString()}
                </Typography>
            </Box>

            {analyzeResult.isFirstRun ? (
                <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Folder color="primary" />
                        <Typography variant="subtitle1">All Current Items</Typography>
                        <Chip label={`${analyzeResult.allCurrentEntries.length}`} size="small" color="primary" sx={{ ml: "auto" }} />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <List dense disablePadding>
                        {analyzeResult.allCurrentEntries.map((item) => (
                            <EntryItem key={item.relativePath} entry={item} />
                        ))}
                    </List>
                </Paper>
            ) : (<>
                <DiffSection
                    title="Added Items"
                    color="success"
                    icon={<Folder color="success" />}
                    entries={analyzeResult.newItems}
                    emptyText="No added items"
                />

                <DiffSection
                    title="Modified Items"
                    color="warning"
                    icon={<Folder color="warning" />}
                    entries={analyzeResult.changedFiles}
                    emptyText="No modified items"
                />

                <DiffSection
                    title="Removed Items"
                    color="error"
                    icon={<Folder color="error" />}
                    entries={analyzeResult.deletedItems}
                    emptyText="No removed items"
                />

                {analyzeResult.newItems.length === 0 && analyzeResult.changedFiles.length === 0 && analyzeResult.deletedItems.length === 0 && (
                    <Alert severity="success">No changes detected in this analysis.</Alert>
                )}
            </>)}

        </>
    );
}