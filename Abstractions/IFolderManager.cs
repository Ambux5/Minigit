using System.Threading;
using System.Threading.Tasks;
using MiniGitApplication.Models;

namespace MiniGitApplication.Abstractions
{
    /// <summary>
    /// Manages folder analysis and change tracking with snapshot-based diff detection.
    /// </summary>
    public interface IFolderManager
    {
        /// <summary>
        /// Analyzes a directory for changes since the last run.
        /// On first call, creates a snapshot. Subsequent calls compare and report diffs.
        /// </summary>
        /// <param name="folderPath">Absolute path to the directory to analyze.</param>
        /// <param name="cancellationToken">Cancellation token for async operations.</param>
        /// <returns>Analysis result containing change information.</returns>
        /// <exception cref="System.IO.DirectoryNotFoundException">Thrown when the folder does not exist.</exception>
        /// <exception cref="System.ArgumentException">Thrown when folderPath is null or whitespace.</exception>
        Task<AnalysisResult> AnalyzeAsync(string folderPath, CancellationToken cancellationToken = default);
    }
}
