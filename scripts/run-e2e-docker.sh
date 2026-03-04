#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

docker run --rm --network host \
  -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.58.2-jammy \
  bash -lc "npm install --no-fund --no-audit && npx playwright test"
