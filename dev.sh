#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_FILE="$ROOT_DIR/Minigit.csproj"
CLIENT_DIR="$ROOT_DIR/ClientApp"
TESTS_PROJECT="$ROOT_DIR/tests/Minigit.Tests/Minigit.Tests.csproj"

ensure_command() {
  local cmd="$1"
  local hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command '$cmd'. $hint" >&2
    exit 1
  fi
}

show_help() {
  cat <<'EOF'
MiniGit helper script

Usage:
  ./dev.sh build   Build backend and frontend
  ./dev.sh run     Build everything and run app (production mode, port 5000)
  ./dev.sh test    Run backend tests
  ./dev.sh help    Show this help
EOF
}

build_all() {
  ensure_command "dotnet" "Install .NET 6 SDK or newer."
  ensure_command "yarn" "Install Node.js and Yarn."

  echo "Restoring and building backend..."
  dotnet restore "$PROJECT_FILE"
  dotnet build "$PROJECT_FILE"

  echo "Installing frontend dependencies and building frontend..."
  pushd "$CLIENT_DIR" >/dev/null
  yarn install
  yarn build
  popd >/dev/null

  echo "Build completed."
}

run_app() {
  build_all

  echo "Starting app with static frontend (ASPNETCORE_ENVIRONMENT=Production, ASPNETCORE_URLS=http://localhost:5000)..."
  echo "App URL: http://localhost:5000"
  echo "Swagger URL: http://localhost:5000/swagger"
  ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_URLS=http://localhost:5000 dotnet run --project "$PROJECT_FILE" --no-launch-profile
}

run_tests() {
  ensure_command "dotnet" "Install .NET 6 SDK or newer."
  dotnet test "$TESTS_PROJECT"
}

COMMAND="${1:-help}"

case "$COMMAND" in
  build)
    build_all
    ;;
  run)
    run_app
    ;;
  test)
    run_tests
    ;;
  help|-h|--help)
    show_help
    ;;
  *)
    echo "Unknown command: $COMMAND" >&2
    show_help
    exit 1
    ;;
esac
