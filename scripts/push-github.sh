#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Set GITHUB_TOKEN (repo scope) then re-run:"
  echo "  export GITHUB_TOKEN=ghp_xxxx"
  echo "  ./scripts/push-github.sh"
  exit 1
fi

echo "$GITHUB_TOKEN" | gh auth login --with-token 2>/dev/null || true
git push -u origin main

echo "Done: https://github.com/hmd1981/omoney"
