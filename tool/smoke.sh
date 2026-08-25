#!/usr/bin/env bash
# Quicky smoke gate: config JSON validity + served web-build sanity
# (+ optional live Convex endpoint check when .env.local exists).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail() { echo "✖ $1"; exit 1; }
ok() { echo "✔ $1"; }

# 1. All shipped JSON configs must parse.
for f in web/manifest.json vercel.json package.json; do
  python3 -c "import json;json.load(open('$f'))" || fail "$f is not valid JSON"
  ok "$f parses"
done

# 2. A release web build must exist (build it if missing).
if [ ! -f build/web/flutter_bootstrap.js ]; then
  echo "… building web (release) …"
  flutter build web --release || fail "flutter build web failed"
fi
for f in index.html flutter_bootstrap.js main.dart.js manifest.json flutter_service_worker.js; do
  [ -f "build/web/$f" ] || fail "build/web/$f missing from release output"
done
ok "release build contains all PWA entry files"

# 3. Serve the build and fetch the entrypoints.
PORT="${SMOKE_PORT:-8098}"
python3 -m http.server "$PORT" --directory build/web > /tmp/quicky_smoke_serve.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 2
for path in / /flutter_bootstrap.js /manifest.json /main.dart.js; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT$path")
  [ "$code" = "200" ] || fail "GET $path -> $code (expected 200)"
done
ok "served build responds 200 on all entrypoints"

# 4. Optional: live Convex httpActions (local deployment via .env.local).
if [ -f .env.local ]; then
  # shellcheck disable=SC1091
  SITE_URL="$(grep '^CONVEX_SITE_URL=' .env.local | cut -d= -f2 || true)"
  if [ -n "$SITE_URL" ]; then
    body=$(curl -s -m 20 "$SITE_URL/api/weather?lat=13.7563&lng=100.5018&units=C" || true)
    echo "$body" | python3 -c "import json,sys;d=json.load(sys.stdin);assert 'tempC' in d and 'forecast' in d" \
      && ok "convex /api/weather live ($body)" \
      || echo "⚠ convex /api/weather not reachable (is \`npm run convex:dev\` up?) — skipping"
  fi
fi

echo "SMOKE PASS"
