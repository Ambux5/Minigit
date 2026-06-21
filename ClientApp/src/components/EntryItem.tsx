import React from 'react';
import { FileEntry } from '../types/minigit';
import ListItem from '@mui/material/ListItem/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon/ListItemIcon';
import { Folder } from '@mui/icons-material';
import { InsertDriveFile } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText/ListItemText';
import Chip from '@mui/material/Chip/Chip';

interface EntryItemProps {
    entry: FileEntry;
}

export function EntryItem({ entry }: Readonly<EntryItemProps>) {
    return (
        <ListItem dense>
            <ListItemIcon sx={{ minWidth: 32 }}>
                {entry.isDirectory ? <Folder color="primary" /> : <InsertDriveFile color="action" />}
            </ListItemIcon>
            <ListItemText primary={entry.relativePath} />
            {!entry.isDirectory && (
                <Chip label={`Version: ${entry.version}`} />
            )}
        </ListItem>
    );
}