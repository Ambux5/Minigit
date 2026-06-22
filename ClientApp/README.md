# MiniGit Application

A simple directory analysis app to track file changes (new, modified, deleted).

## Quick Start

```bash
# Install dependencies
yarn install

# Run with real backend
yarn start

# Run with mock API (default)
yarn start
```

## Testing with Mock API

Test different scenarios by entering keywords:

| Input | Scenario |
|-------|----------|
| `first` | First analysis - all files new (9 items) |
| `modified` | Modified files - shows changes |
| `deleted` | Deleted files - shows removed items |
| anything else | Default mix - new + modified + deleted |



