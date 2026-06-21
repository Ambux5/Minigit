export interface FileEntry {
    relativePath: string;
    isDirectory: boolean;
    version: string;
}

export interface ScanResult {
    isFistScan: boolean;
    newItems: FileEntry[];
    modifiedItems: FileEntry[];
    deletedItems: FileEntry[];
    allCurrentItems: FileEntry[];
    scanAt: string;
}