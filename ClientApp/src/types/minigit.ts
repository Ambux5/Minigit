export interface FileEntry {
    relativePath: string;
    isDirectory: boolean;
    contentHash: string;
    version: number;
}

export interface AnalyzeResult {
    isFirstRun: boolean;
    newItems: FileEntry[];
    changedFiles: FileEntry[];
    deletedItems: FileEntry[];
    allCurrentEntries: FileEntry[];
    totalChanges: number;
    analyzedAt: string;
}
