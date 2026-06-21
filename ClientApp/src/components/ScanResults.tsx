import React from 'react';
import { ScanResult } from '../types/minigit';
import Box from '@mui/material/Box/Box';
import Typography from '@mui/material/Typography/Typography';
import { Alert, Chip, Divider, Paper } from '@mui/material';
import { Folder } from '@mui/icons-material';
import { List } from '@mui/material';
import { EntryItem } from './EntryItem';
import { DiffSection } from './DiffSection';

interface ScanResultsProps {
    scanResult: ScanResult;
}

export function ScanResults({ scanResult }: Readonly<ScanResultsProps>) {
    return (
        <>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">Scan Results</Typography>
                {scanResult.isFistScan ? (
                    <Typography variant="body2" color="info">(First Scan)</Typography>
                ) : (
                    <Typography variant="body2" color="textSecondary">(Scan Difference)</Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                    {new Date(scanResult.scanAt).toLocaleString()}
                </Typography>
            </Box>

            {scanResult.isFistScan ? (
                <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Folder color="primary" />
                        <Typography variant="subtitle1">All Current Items</Typography>
                        <Chip label={`${scanResult.allCurrentItems.length}`} size="small" color="primary" sx={{ ml: "auto" }} />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <List dense disablePadding>
                        {scanResult.allCurrentItems.map((item) => (
                            <EntryItem key={item.relativePath} entry={item} />
                        ))}
                    </List>
                </Paper>
            ) : (<>
                <DiffSection
                    title="Added Items"
                    color="success"
                    icon={<Folder color="success" />}
                    entries={scanResult.newItems}
                    emptyText="No added items"
                />

                <DiffSection
                    title="Modified Items"
                    color="warning"
                    icon={<Folder color="warning" />}
                    entries={scanResult.modifiedItems}
                    emptyText="No modified items"
                />

                <DiffSection
                    title="Removed Items"
                    color="error"
                    icon={<Folder color="error" />}
                    entries={scanResult.deletedItems}
                    emptyText="No removed items"
                />

                {scanResult.newItems.length === 0 && scanResult.modifiedItems.length === 0 && scanResult.deletedItems.length === 0 && (
                    <Alert severity="success">No changes detected in this scan.</Alert>
                )}
            </>)}

        </>
    );
}