#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT/kaser-dokan-backend"
command -v java >/dev/null || { echo "Java 21 required (brew install openjdk@21)"; exit 1; }
command -v mvn >/dev/null || { echo "Maven required (brew install maven)"; exit 1; }
if [ -f .env ]; then
  set -a
  source ./.env
  set +a
fi
PORT_TO_USE="${PORT:-3000}"
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -nP -tiTCP:"$PORT_TO_USE" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    echo ""
    echo "ERROR: Port $PORT_TO_USE is already in use. You may be viewing another app's sign-in page."
    echo "Listening processes:"
    lsof -nP -iTCP:"$PORT_TO_USE" -sTCP:LISTEN || true
    echo ""
    echo "Stop that app yourself, OR launch this project on another port:"
    echo "  cd '$ROOT/kaser-dokan-backend'"
    echo "  PORT=3001 mvn spring-boot:run"
    echo "Then open http://localhost:3001"
    echo "No existing processes have been killed."
    exit 2
  fi
fi
# Pin the exact Python interpreter used by the Spring server and install edge-tts in its own venv.
if [ -z "${PYTHON_TTS_BIN:-}" ]; then
  TTS_VENV="$ROOT/.venv-tts"
  if [ ! -x "$TTS_VENV/bin/python" ]; then
    echo "Creating isolated Microsoft Edge TTS Python environment..."
    python3 -m venv "$TTS_VENV" || { echo "ERROR: Could not create Python TTS environment"; exit 1; }
  fi
  export PYTHON_TTS_BIN="$TTS_VENV/bin/python"
fi
if ! "$PYTHON_TTS_BIN" -m edge_tts --help >/dev/null 2>&1; then
  echo "Installing Microsoft Edge TTS (internet needed)..."
  "$PYTHON_TTS_BIN" -m pip install --disable-pip-version-check edge-tts || {
    echo "ERROR: Edge TTS installation failed. Bangla voice will not work."
    echo "Run: $PYTHON_TTS_BIN -m pip install edge-tts"
    exit 1
  }
fi
"$PYTHON_TTS_BIN" -m edge_tts --help >/dev/null 2>&1 || { echo "ERROR: Edge TTS still unavailable"; exit 1; }
echo "Microsoft Edge TTS ready using: $PYTHON_TTS_BIN"
printf '\nStarting Kacher Dokan v29 at http://localhost:%s\n' "$PORT_TO_USE"
echo "If MongoDB login fails, check kaser-dokan-backend/.env and Atlas access settings."
mvn spring-boot:run
