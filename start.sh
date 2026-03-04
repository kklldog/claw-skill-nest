#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[Agile Skill Hub] Starting..."

if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    echo "[Agile Skill Hub] Using Docker Compose"
    docker compose up -d
    echo "[Agile Skill Hub] Started at http://localhost:17890"
    exit 0
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "[Agile Skill Hub] Using docker-compose"
    docker-compose up -d
    echo "[Agile Skill Hub] Started at http://localhost:17890"
    exit 0
  fi
fi

echo "[Agile Skill Hub] Docker Compose not found, fallback to Node.js mode"

if [[ ! -d node_modules ]]; then
  echo "[Agile Skill Hub] Installing dependencies..."
  npm install
fi

if [[ -f .run.pid ]] && kill -0 "$(cat .run.pid)" 2>/dev/null; then
  echo "[Agile Skill Hub] Already running (PID: $(cat .run.pid))"
  exit 0
fi

nohup npm start > .run.log 2>&1 &
echo $! > .run.pid

echo "[Agile Skill Hub] Started (PID: $(cat .run.pid))"
echo "[Agile Skill Hub] Logs: tail -f $ROOT_DIR/.run.log"
echo "[Agile Skill Hub] URL: http://localhost:17890"
