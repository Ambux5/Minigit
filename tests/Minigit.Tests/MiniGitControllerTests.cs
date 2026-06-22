using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FakeItEasy;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using MiniGitApplication.Abstractions;
using MiniGitApplication.Controllers;
using MiniGitApplication.Models;
using NUnit.Framework;

namespace Minigit.Tests;

[TestFixture]
public class MiniGitControllerTests
{
    [Test]
    public async Task Analyze_EmptyPath_ReturnsBadRequest()
    {
        var manager = A.Fake<IFolderManager>();
        var controller = CreateController(manager);

        var result = await controller.Analyze(" ", CancellationToken.None);

        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequest = (BadRequestObjectResult)result;
        badRequest.StatusCode.Should().Be(400);
    }

    [Test]
    public async Task Analyze_WhenFolderMissing_ReturnsNotFound()
    {
        var manager = A.Fake<IFolderManager>();
        A.CallTo(() => manager.AnalyzeAsync(A<string>._, A<CancellationToken>._))
            .Throws(new DirectoryNotFoundException("missing"));

        var controller = CreateController(manager);

        var result = await controller.Analyze("C:\\missing", CancellationToken.None);

        result.Should().BeOfType<NotFoundObjectResult>();
        var notFound = (NotFoundObjectResult)result;
        notFound.StatusCode.Should().Be(404);
    }

    [Test]
    public async Task Analyze_WhenSuccessful_ReturnsOkWithAnalysisResult()
    {
        var expected = new AnalysisResult { IsFirstRun = true };
        var manager = A.Fake<IFolderManager>();
        A.CallTo(() => manager.AnalyzeAsync(A<string>._, A<CancellationToken>._))
            .Returns(expected);

        var controller = CreateController(manager);

        var result = await controller.Analyze("C:\\data", CancellationToken.None);

        result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result;
        ok.Value.Should().BeSameAs(expected);
    }

    private static MiniGitController CreateController(IFolderManager manager)
    {
        return new MiniGitController(manager, NullLogger<MiniGitController>.Instance);
    }
}
