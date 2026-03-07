#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[Claw Skill Nest] Starting..."

if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    echo "[Claw Skill Nest] Using Docker Compose"
    docker compose up -d
    echo "[Claw Skill Nest] Started at http://localhost:17890"
    exit 0
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "[Claw Skill Nest] Using docker-compose"
    docker-compose up -d
    echo "[Claw Skill Nest] Started at http://localhost:17890"
    exit 0
  fi
fi

echo "[Claw Skill Nest] Docker Compose not found, fallback to Node.js mode"

if [[ ! -d node_modules ]]; then
  echo "[Claw Skill Nest] Installing dependencies..."
  npm install
fi

if [[ -f .run.pid ]] && kill -0 "$(cat .run.pid)" 2>/dev/null; then
  echo "[Claw Skill Nest] Already running (PID: $(cat .run.pid))"
  exit 0
fi

nohup npm start > .run.log 2>&1 &
echo $! > .run.pid

echo "[Claw Skill Nest] Started (PID: $(cat .run.pid))"
echo "[Claw Skill Nest] Logs: tail -f $ROOT_DIR/.run.log"
echo "[Claw Skill Nest] URL: http://localhost:17890"
