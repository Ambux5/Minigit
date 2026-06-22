using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MiniGitApplication.Managers;
using MiniGitApplication.Options;
using NUnit.Framework;

namespace Minigit.Tests;

[TestFixture]
public class FolderManagerTests
{
    [Test]
    public async Task AnalyzeAsync_FirstRun_ReturnsInitialSnapshotState()
    {
        var testRoot = CreateTempDirectory();
        var storagePath = Path.Combine(testRoot, "snapshots");
        var analyzedPath = Path.Combine(testRoot, "workspace");

        Directory.CreateDirectory(analyzedPath);
        Directory.CreateDirectory(Path.Combine(analyzedPath, "sub"));
        await File.WriteAllTextAsync(Path.Combine(analyzedPath, "a.txt"), "v1");

        var sut = CreateManager(storagePath);

        try
        {
            var result = await sut.AnalyzeAsync(analyzedPath);

            result.IsFirstRun.Should().BeTrue();
            result.NewItems.Should().BeEmpty();
            result.ChangedFiles.Should().BeEmpty();
            result.DeletedItems.Should().BeEmpty();
            result.AllCurrentEntries.Should().HaveCount(2);

            var fileEntry = result.AllCurrentEntries.Where(e => !e.IsDirectory).Should().ContainSingle().Subject;
            fileEntry.RelativePath.Should().Be("a.txt");
            fileEntry.Version.Should().Be(1);

            Directory.EnumerateFiles(storagePath, "*.json").Any().Should().BeTrue();
        }
        finally
        {
            DeleteDirectory(testRoot);
        }
    }

    [Test]
    public async Task AnalyzeAsync_SecondRun_DetectsNewChangedDeletedAndVersionIncrement()
    {
        var testRoot = CreateTempDirectory();
        var storagePath = Path.Combine(testRoot, "snapshots");
        var analyzedPath = Path.Combine(testRoot, "workspace");

        Directory.CreateDirectory(analyzedPath);

        var firstFile = Path.Combine(analyzedPath, "first.txt");
        var secondFile = Path.Combine(analyzedPath, "second.txt");
        var thirdFile = Path.Combine(analyzedPath, "third.txt");

        await File.WriteAllTextAsync(firstFile, "v1");
        await File.WriteAllTextAsync(secondFile, "keep");

        var sut = CreateManager(storagePath);

        try
        {
            await sut.AnalyzeAsync(analyzedPath);

            await File.WriteAllTextAsync(firstFile, "v2");
            File.Delete(secondFile);
            await File.WriteAllTextAsync(thirdFile, "new");

            var result = await sut.AnalyzeAsync(analyzedPath);

            result.IsFirstRun.Should().BeFalse();
            result.TotalChanges.Should().Be(3);

            var changed = result.ChangedFiles.Should().ContainSingle().Subject;
            changed.RelativePath.Should().Be("first.txt");
            changed.Version.Should().Be(2);

            var added = result.NewItems.Should().ContainSingle().Subject;
            added.RelativePath.Should().Be("third.txt");
            added.Version.Should().Be(1);

            var deleted = result.DeletedItems.Should().ContainSingle().Subject;
            deleted.RelativePath.Should().Be("second.txt");
            deleted.Version.Should().Be(1);
        }
        finally
        {
            DeleteDirectory(testRoot);
        }
    }

    [Test]
    public async Task AnalyzeAsync_NonExistingDirectory_ThrowsDirectoryNotFoundException()
    {
        var testRoot = CreateTempDirectory();
        var storagePath = Path.Combine(testRoot, "snapshots");
        var missingPath = Path.Combine(testRoot, "missing");

        var sut = CreateManager(storagePath);

        try
        {
            var act = async () => await sut.AnalyzeAsync(missingPath);
            await act.Should().ThrowAsync<DirectoryNotFoundException>();
        }
        finally
        {
            DeleteDirectory(testRoot);
        }
    }

    private static FolderManager CreateManager(string storagePath)
    {
        var options = Options.Create(new FolderOptions { StoragePath = storagePath });
        return new FolderManager(options, NullLogger<FolderManager>.Instance);
    }

    private static string CreateTempDirectory()
    {
        var path = Path.Combine(Path.GetTempPath(), "minigit-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(path);
        return path;
    }

    private static void DeleteDirectory(string path)
    {
        if (Directory.Exists(path))
        {
            Directory.Delete(path, recursive: true);
        }
    }
}
