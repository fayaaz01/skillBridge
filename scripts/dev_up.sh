#!/usr/bin/env bash
set -euo pipefail

# One-click local setup script
# Usage: bash /workspace/scripts/dev_up.sh [--start-emulators] [--start-mobile]

ROOT=/workspace
AI_DIR="$ROOT/server/ai"
FN_DIR="$ROOT/server/functions"
MOBILE_DIR="$ROOT/mobile"
PYTHON="python3"
UVICORN_CMD=""

echo "[1/3] Setting up AI service (FastAPI)"
cd "$AI_DIR"
if $PYTHON -c "import ensurepip" >/dev/null 2>&1; then
  $PYTHON -m venv "$AI_DIR/.venv" || true
  source "$AI_DIR/.venv/bin/activate"
  pip install --upgrade pip >/dev/null
  pip install -r "$AI_DIR/requirements.txt" >/dev/null
  UVICORN_CMD="uvicorn"
else
  echo "ensurepip not available; installing requirements with --user"
  $PYTHON -m pip install --user --upgrade pip >/dev/null || true
  $PYTHON -m pip install --user -r "$AI_DIR/requirements.txt" >/dev/null
  UVICORN_CMD="$PYTHON -m uvicorn"
fi
echo "Starting AI service on :8000 ..."
nohup $UVICORN_CMD main:app --host 0.0.0.0 --port 8000 > "$AI_DIR/ai.log" 2>&1 &
AI_PID=$!
echo "AI service PID: $AI_PID (logs: $AI_DIR/ai.log)"
if [[ -n "${VIRTUAL_ENV:-}" ]]; then deactivate || true; fi

echo "[2/3] Preparing Firebase Functions"
cd "$FN_DIR"
npm install >/dev/null 2>&1 || npm install
npm run build
if [[ "${1:-}" == "--start-emulators" || "${2:-}" == "--start-emulators" ]]; then
  echo "Starting Firebase emulators..."
  cd "$ROOT"
  AI_URL=http://localhost:8000 firebase emulators:start
else
  echo "To start emulators later, run:"
  echo "  cd $ROOT && AI_URL=http://localhost:8000 firebase emulators:start"
fi

echo "[3/3] Preparing Mobile App (Expo)"
cd "$MOBILE_DIR"
npm install >/dev/null 2>&1 || npm install
if [[ "${1:-}" == "--start-mobile" || "${2:-}" == "--start-mobile" ]]; then
  echo "Starting Expo dev server..."
  npm run start
else
  echo "To start the mobile app later, run:"
  echo "  cd $MOBILE_DIR && npm run start"
fi

echo "Done. AI is running. Emulators and mobile can be started with the commands above."
