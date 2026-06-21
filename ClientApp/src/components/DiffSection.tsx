import { Box, Chip, Divider, List, Paper, Typography } from "@mui/material";
import { FileEntry } from "../types/minigit";
import { EntryItem } from "./EntryItem";

interface DiffSectionProps {
    title: string;
    color: string;
    icon: React.ReactNode;
    entries: FileEntry[];
    emptyText: string;
}


export function DiffSection({ title, color, icon, entries, emptyText }: Readonly<DiffSectionProps>) {
    return (
        <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
                {icon}
                <Typography variant="subtitle1">{title}</Typography>
                <Chip label={`${entries.length}`} size="small" color={color as any} sx={{ ml: "auto" }} />
            </Box>
            <Divider sx={{ mb: 1 }} />
            {entries.length === 0 ? (
                <Typography variant="body2" color="textSecondary">{emptyText}</Typography>
            ) : (
                <List dense disablePadding>
                    {entries.map((item) => (
                        <EntryItem key={item.relativePath} entry={item} />
                    ))}
                </List>
            )}
        </Paper>
    );
}