#!/usr/bin/env bash
# One-click Quicky launcher — opens the app in Chrome (Flutter web).
# The native Linux binary has a known Wayland no-window bug on this machine,
# so we serve the web build which works reliably.
set -euo pipefail

# Path to this script's directory (handles spaces + '!' in the folder name).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT=8090
FLUTTER_BIN="$HOME/snap/flutter/common/flutter/bin/flutter"
CHROME_BIN="/usr/bin/google-chrome-stable"

echo "▶ Quicky launcher: building/serving web build on port $PORT ..."

# Launch Flutter web dev server in the background, detached so it survives.
nohup "$FLUTTER_BIN" run -d chrome --web-port "$PORT" > /tmp/quicky_launcher.log 2>&1 &
FLUTTER_PID=$!
echo "  flutter pid=$FLUTTER_PID (log: /tmp/quicky_launcher.log)"

# Wait for the server to come up (max ~90s for cold compile).
for i in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:$PORT"; then
    echo "  server up after ${i}0s-ish"
    break
  fi
  sleep 3
done

# Open the app in Chrome (new tab/window).
"$CHROME_BIN" "http://localhost:$PORT" >/dev/null 2>&1 &
echo "▶ Quicky opened at http://localhost:$PORT"
