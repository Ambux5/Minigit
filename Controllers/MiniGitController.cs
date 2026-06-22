using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MiniGitApplication.Abstractions;

namespace MiniGitApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MiniGitController : ControllerBase
    {
        private readonly IFolderManager _folderManager;
        private readonly ILogger<MiniGitController> _logger;

        public MiniGitController(IFolderManager folderManager, ILogger<MiniGitController> logger)
        {
            _folderManager = folderManager;
            _logger = logger;
        }

        [HttpGet("analyze")]
        public async Task<IActionResult> Analyze(
            [FromQuery] string path,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(path))
                return BadRequest(new { error = "Query parameter 'path' is required." });

            try
            {
                _logger.LogInformation("Received analyze request for path: {Path}", path);
                var result = await _folderManager.AnalyzeAsync(path, cancellationToken);
                return Ok(result);
            }
            catch (OperationCanceledException ex)
            {
                _logger.LogInformation(ex, "Analyze was cancelled for path: {Path}", path);
                return StatusCode(499, new { error = "Analyze was cancelled." });
            }
            catch (DirectoryNotFoundException ex)
            {
                _logger.LogWarning(ex, "Directory not found: {Path}", path);
                return NotFound(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for path: {Path}", path);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while analyzing {Path}", path);
                return StatusCode(500, new { error = "An unexpected error occurred." });
            }
        }
    }
}
