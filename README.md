# MiniGitApplication

MiniGitApplication is a simple ASP.NET Core application (C# backend + React UI) that detects changes in a selected local directory between manual runs.

## Assignment Coverage

This solution covers the requested behavior:

- first run creates an initial snapshot of the directory
- each next run compares the current state with the previous snapshot and reports:
  - new files and subdirectories
  - changed files (content change)
  - deleted files and subdirectories
- each file tracks a version number:
  - first appearance starts at version `1`
  - each detected content change increments the version by `1`
- manual execution only (no automatic filesystem watchers)
- persistence without a database (JSON snapshots)

## Architecture Overview

- Backend: ASP.NET Core Web API
- Frontend: React (TypeScript + MUI)
- Core service: `FolderManager` (snapshot + diff logic)
- Storage: JSON files in the configured `data` directory

## API

- Endpoint: `GET /api/minigit/analyze?path=<absolute_path>`
- Query parameter:
  - `path` (required): absolute path to the local directory to analyze

Example:

`http://localhost:5000/api/minigit/analyze?path=C:%5Ctestdownload`

## Backend Tests

Simple NUnit tests are included in:

- `tests/Minigit.Tests`

Testing stack:

- NUnit
- FluentAssertions
- FakeItEasy

Covered scenarios:

- `FolderManager` first run behavior
- `FolderManager` diff detection (new/changed/deleted + version increment)
- `FolderManager` invalid path handling
- `MiniGitController` API response mapping (`400`, `404`, `200`)

Run tests:

- `dotnet test tests/Minigit.Tests/Minigit.Tests.csproj`

## Developer Scripts

To simplify common workflows, the project includes root helper scripts for both platforms.

- Windows (PowerShell): `dev.ps1`
- Linux/macOS (bash): `dev.sh`

Supported commands:

- `build` - build backend and frontend
- `run` - build everything and run the app in single-port mode on `http://localhost:5000` (serves UI + API together)
- `test` - run backend tests

Note: frontend steps in these scripts use `yarn`.

Port behavior:

- `./dev.ps1 run` or `./dev.sh run`: single app URL on `http://localhost:5000` (UI + API + OpenAPI docs)
- Swagger/OpenAPI is available at `http://localhost:5000/swagger`

Examples:

- Windows:
  - `./dev.ps1 build`
  - `./dev.ps1 run`
  - `./dev.ps1 test`
- Linux/macOS:
  - `chmod +x ./dev.sh`
  - `./dev.sh build`
  - `./dev.sh run`
  - `./dev.sh test`

## UI

The UI provides:

- text input for absolute directory path
- Analyze button to run analysis manually
- result view for added / modified / removed items

## Persistence Details

- Snapshots are stored as JSON files.
- Each analyzed root path maps to a deterministic snapshot filename (SHA256-based key).
- No SQL/NoSQL database is used.

## Known Limitations

- Manual trigger only: changes are not detected in real time.
- If some folders/files are inaccessible (permissions), those parts may be skipped.
- File hashing reads file contents during each run; acceptable for assignment constraints but less optimal for very large datasets.
- Current implementation uses MD5 for content-change detection (sufficient for this exercise, not security-oriented).

## Possible Improvements

- Add optional filtering (ignore patterns like `.git`, `node_modules`, temp files).
- Add pagination/virtualization for large result sets in the UI.
- Add integration tests for API + snapshot persistence.
- Add richer error reporting (e.g., per-path warnings collected in response).
- Add optional parallel hashing for better performance on larger directories.
- Replace MD5 with SHA256 for stronger hash collision resistance.

## AI Usage

Parts of the implementation were created/refined with AI assistance (GitHub Copilot / GPT-5.3-Codex).
