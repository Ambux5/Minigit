using System;
using System.Collections.Generic;

namespace MiniGitApplication.Models
{
    /// <summary>
    /// Represents a file or directory entry in a folder snapshot.
    /// </summary>
    public class FileEntry
    {
        /// <summary>Gets or sets the relative path from the folder root.</summary>
        public string RelativePath { get; set; } = string.Empty;

        /// <summary>Gets or sets a value indicating whether this entry is a directory.</summary>
        public bool IsDirectory { get; set; }

        /// <summary>Gets or sets the MD5 hash of file content. Empty for directories.</summary>
        public string ContentHash { get; set; } = string.Empty;

        /// <summary>Gets or sets the version counter. Starts at 1, increments on every content change.</summary>
        public int Version { get; set; } = 1;
    }

    /// <summary>
    /// Represents a snapshot of a folder's state at a specific point in time.
    /// </summary>
    public class FolderSnapshot
    {
        /// <summary>Gets or sets the absolute path of the analyzed folder.</summary>
        public string FolderPath { get; set; } = string.Empty;

        /// <summary>Gets or sets the timestamp when this snapshot was captured.</summary>
        public DateTime CapturedAt { get; set; }

        /// <summary>Gets or sets the list of file and folder entries.</summary>
        public List<FileEntry> Entries { get; set; } = new();
    }

    /// <summary>
    /// Represents the result of a folder analysis, including detected changes and metadata.
    /// </summary>
    public class AnalysisResult
    {
        /// <summary>Gets or sets a value indicating whether this is the first analysis run.</summary>
        public bool IsFirstRun { get; set; }

        /// <summary>Gets or sets the list of newly created files or folders.</summary>
        public List<FileEntry> NewItems { get; set; } = new();

        /// <summary>Gets or sets the list of modified files (content changes detected).</summary>
        public List<FileEntry> ChangedFiles { get; set; } = new();

        /// <summary>Gets or sets the list of deleted files or folders.</summary>
        public List<FileEntry> DeletedItems { get; set; } = new();

        /// <summary>Gets or sets the list of all files and folders in the current state.</summary>
        public List<FileEntry> AllCurrentEntries { get; set; } = new();

        /// <summary>Gets or sets the timestamp when this analysis was performed.</summary>
        public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Gets or sets the total number of changes detected (new + changed + deleted).</summary>
        public int TotalChanges => NewItems.Count + ChangedFiles.Count + DeletedItems.Count;
    }
}
