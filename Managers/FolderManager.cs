using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MiniGitApplication.Abstractions;
using MiniGitApplication.Models;
using MiniGitApplication.Options;

#nullable enable

namespace MiniGitApplication.Managers
{
    /// <summary>
    /// Manages folder analysis and change detection using snapshot-based comparison.
    /// Stores snapshots as JSON for efficient diff calculation.
    /// </summary>
    public class FolderManager : IFolderManager
    {
        private readonly FolderOptions _options;
        private readonly ILogger<FolderManager> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new() { WriteIndented = true };

        public FolderManager(IOptions<FolderOptions> options, ILogger<FolderManager> logger)
        {
            _options = options.Value ?? throw new ArgumentNullException(nameof(options));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Analyzes a directory for changes by comparing with the last stored snapshot.
        /// </summary>
        public async Task<AnalysisResult> AnalyzeAsync(string folderPath, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(folderPath))
                throw new ArgumentException("Folder path cannot be null or whitespace.", nameof(folderPath));

            var stopwatch = Stopwatch.StartNew();

            try
            {
                // Normalize the path so it is consistent across OS
                folderPath = Path.GetFullPath(folderPath);

                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"Directory not found: {folderPath}");

                _logger.LogInformation("Starting analysis of folder: {FolderPath}", folderPath);

                var snapshotFile = GetSnapshotFilePath(folderPath);
                var previous = await LoadSnapshotAsync(snapshotFile, cancellationToken);
                var current = AnalyzeDirectory(folderPath, previous?.Entries, cancellationToken);
                var result = BuildResult(previous, current);

                var snapshot = new FolderSnapshot
                {
                    FolderPath = folderPath,
                    CapturedAt = DateTime.UtcNow,
                    Entries = current
                };

                await SaveSnapshotAsync(snapshotFile, snapshot, cancellationToken);

                result.AllCurrentEntries = current;
                result.AnalyzedAt = DateTime.UtcNow;

                stopwatch.Stop();
                _logger.LogInformation(
                    "Analysis completed. IsFirstRun={IsFirstRun}, Changes={Changes}, Duration={Duration}ms",
                    result.IsFirstRun, result.TotalChanges, stopwatch.ElapsedMilliseconds);

                return result;
            }
            catch (OperationCanceledException ex)
            {
                _logger.LogWarning(ex, "Analysis of {FolderPath} was cancelled.", folderPath);
                throw;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, "Error analyzing folder {FolderPath} after {Duration}ms", folderPath, stopwatch.ElapsedMilliseconds);
                throw;
            }
        }

        // ── Analyzing ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Recursively analyzes a directory and returns a list of all file entries.
        /// </summary>
        private List<FileEntry> AnalyzeDirectory(
            string root,
            List<FileEntry>? previous,
            CancellationToken cancellationToken)
        {
            var prevMap = previous?.ToDictionary(e => e.RelativePath)
                          ?? new Dictionary<string, FileEntry>();
            var entries = new List<FileEntry>();
            AnalyzeRecursive(root, root, prevMap, entries, cancellationToken);
            return entries;
        }

        /// <summary>
        /// Recursively analyzes subdirectories and files.
        /// </summary>
        private void AnalyzeRecursive(
            string root,
            string current,
            Dictionary<string, FileEntry> prevMap,
            List<FileEntry> result,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                foreach (var dir in Directory.GetDirectories(current))
                {
                    var rel = ToRelative(root, dir);
                    var prevVersion = prevMap.TryGetValue(rel, out var p) ? p.Version : 1;
                    result.Add(new FileEntry
                    {
                        RelativePath = rel,
                        IsDirectory = true,
                        ContentHash = string.Empty,
                        Version = prevVersion
                    });
                    AnalyzeRecursive(root, dir, prevMap, result, cancellationToken);
                }

                foreach (var file in Directory.GetFiles(current))
                {
                    var rel = ToRelative(root, file);
                    var hash = ComputeHash(file);
                    var version = 1;

                    if (prevMap.TryGetValue(rel, out var prev))
                    {
                        version = prev.Version;
                        if (prev.ContentHash != hash)
                            version++;
                    }

                    result.Add(new FileEntry
                    {
                        RelativePath = rel,
                        IsDirectory = false,
                        ContentHash = hash,
                        Version = version
                    });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Access denied while analyzing {Dir}", current);
            }
        }

        // ── Comparison ───────────────────────────────────────────────────────────

        /// <summary>
        /// Compares previous and current snapshots to identify changes.
        /// </summary>
        private static AnalysisResult BuildResult(FolderSnapshot? previous, List<FileEntry> current)
        {
            var result = new AnalysisResult();

            if (previous is null)
            {
                result.IsFirstRun = true;
                return result;
            }

            var prevMap = previous.Entries.ToDictionary(e => e.RelativePath);
            var currMap = current.ToDictionary(e => e.RelativePath);

            result.NewItems = current
                .Where(e => !prevMap.ContainsKey(e.RelativePath))
                .ToList();

            result.DeletedItems = previous.Entries
                .Where(e => !currMap.ContainsKey(e.RelativePath))
                .ToList();

            result.ChangedFiles = current
                .Where(e => !e.IsDirectory
                            && prevMap.TryGetValue(e.RelativePath, out var prev)
                            && prev.ContentHash != e.ContentHash)
                .ToList();

            return result;
        }

        // ── Persistence (JSON) ───────────────────────────────────────────────────

        /// <summary>
        /// Derives a snapshot file path from the folder path using SHA256 hashing.
        /// </summary>
        private string GetSnapshotFilePath(string folderPath)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(folderPath.ToLowerInvariant()));
            var key = Convert.ToHexString(bytes)[..16];

            var dir = Path.IsPathRooted(_options.StoragePath)
                ? _options.StoragePath
                : Path.Combine(AppContext.BaseDirectory, _options.StoragePath);

            Directory.CreateDirectory(dir);
            return Path.Combine(dir, $"{key}.json");
        }

        /// <summary>
        /// Loads a snapshot from a JSON file asynchronously.
        /// </summary>
        private static async Task<FolderSnapshot?> LoadSnapshotAsync(
            string path,
            CancellationToken cancellationToken)
        {
            if (!File.Exists(path)) return null;

            await using var stream = File.OpenRead(path);
            return await JsonSerializer.DeserializeAsync<FolderSnapshot>(stream, cancellationToken: cancellationToken);
        }

        /// <summary>
        /// Saves a snapshot to a JSON file asynchronously.
        /// </summary>
        private static async Task SaveSnapshotAsync(
            string path,
            FolderSnapshot snapshot,
            CancellationToken cancellationToken)
        {
            await using var stream = File.Create(path);
            await JsonSerializer.SerializeAsync(stream, snapshot, JsonOpts, cancellationToken);
        }

        // ── Helpers ──────────────────────────────────────────────────────────────

        /// <summary>
        /// Converts an absolute path to a relative path with forward slashes.
        /// </summary>
        private static string ToRelative(string root, string full) =>
            Path.GetRelativePath(root, full).Replace('\\', '/');

        /// <summary>
        /// Computes MD5 hash of a file's content.
        /// </summary>
        private static string ComputeHash(string filePath)
        {
            using var md5 = MD5.Create();
            using var stream = File.OpenRead(filePath);
            return Convert.ToHexString(md5.ComputeHash(stream));
        }
    }
}
