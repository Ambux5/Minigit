param(
    [Parameter(Position = 0)]
    [ValidateSet("build", "run", "test", "help")]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectFile = Join-Path $RootDir "Minigit.csproj"
$ClientDir = Join-Path $RootDir "ClientApp"
$TestsProject = Join-Path $RootDir "tests\Minigit.Tests\Minigit.Tests.csproj"

function Ensure-Command {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing required command '$Name'. $InstallHint"
    }
}

function Show-Help {
@"
MiniGit helper script

Usage:
  .\dev.ps1 build   Build backend and frontend
    .\dev.ps1 run     Build everything and run app (single-port mode on 5000)
  .\dev.ps1 test    Run backend tests
  .\dev.ps1 help    Show this help
"@ | Write-Host
}

function Build-All {
    Ensure-Command -Name "dotnet" -InstallHint "Install .NET 6 SDK or newer."
    Ensure-Command -Name "yarn" -InstallHint "Install Node.js and Yarn."

    Write-Host "Restoring and building backend..."
    & dotnet restore $ProjectFile
    & dotnet build $ProjectFile

    Write-Host "Installing frontend dependencies and building frontend..."
    Push-Location $ClientDir
    try {
        & yarn install
        & yarn build
    }
    finally {
        Pop-Location
    }

    Write-Host "Build completed."
}

function Run-App {
    Build-All

    Write-Host "Starting app with static frontend (ASPNETCORE_ENVIRONMENT=Production, ASPNETCORE_URLS=http://localhost:5000)..."
    $env:ASPNETCORE_ENVIRONMENT = "Production"
    $env:ASPNETCORE_URLS = "http://localhost:5000"
    Write-Host "App URL: http://localhost:5000"
    Write-Host "Swagger URL: http://localhost:5000/swagger"
    & dotnet run --project $ProjectFile --no-launch-profile
}

function Run-Tests {
    Ensure-Command -Name "dotnet" -InstallHint "Install .NET 6 SDK or newer."
    & dotnet test $TestsProject
}

switch ($Command) {
    "build" { Build-All }
    "run" { Run-App }
    "test" { Run-Tests }
    default { Show-Help }
}
