# Quicky 🏃

A Flutter (iOS/Android/Linux-desktop/Web-PWA) octagon-dashboard shortcut utility for travelers in Thailand.
One central hub + 8 tiles: Cost Translator, Location Finder, Bathroom Toggle, Attractions,
Day Counter, Bolt Launcher, Banking Launcher, Weather.

## Web / PWA (Vercel + Convex)

The same codebase ships as an installable PWA:

- **Installable**: manifest (`web/manifest.json`), offline shell service
  worker (`web/sw.js`, registered from `web/index.html` — network-first for
  `/` and `main.dart.js`, stale-while-revalidate for other same-origin GETs)
  and a Settings "Install Quicky"
  row that consumes the browser's `beforeinstallprompt`.
- **Startup video on every cold launch**: the splash always plays
  `assets/videos/startup.mp4` when the app cold-launches — no per-session
  skip. A "Skip" button in the corner lets the user opt out. Refresh on
  `/weather` (etc.) stays on the deep-link route, not the splash.
- **Launchers on web**: installed-app detection is Android-only; on web the
  Bolt/banking tiles hand off via community URL schemes (best-effort).
- **Convex backend** (`convex/`): pure httpAction proxies with CORS for
  weather (Open-Meteo), attractions (Overpass) and reverse geocoding
  (Nominatim). Dart side (`lib/core/convex/convex_client.dart`) falls back
  Convex → direct API → mock automatically.

### Deploy

1. Backend: `npm install && npm run convex:dev` — a local deployment starts
   with no account needed; `npx convex login` inside that session links a
   cloud project (or use `CONVEX_DEPLOY_KEY` in CI). Note the HTTP actions
   URL `https://<deployment>.convex.site`.
2. Frontend: import this repo into Vercel (Root `/`, no framework preset —
   `vercel.json` drives install/build/output). Set env var
   `CONVEX_SITE_URL=https://<deployment>.convex.site`. Every push to the
   tracked branch deploys; the app is then runnable from the link and
   installable.

### Local web run

```
flutter run -d chrome --dart-define=CONVEX_SITE_URL=$(grep CONVEX_SITE_URL .env.local | cut -d= -f2)
# or without backend (mock/direct fallbacks):
flutter run -d chrome
flutter build web --release   # what Vercel builds
./tool/smoke.sh               # JSON + served-build smoke gate
```

## Architecture
Clean Architecture + Riverpod state. Each tile is an independent feature module under
`lib/features/<name>`. Navigation via GoRouter. Local-first (shared_preferences +
flutter_secure_storage), offline-capable.

## Launcher contract (verified 2026-08-11)
Quicky only triggers *already-installed* designated banking / ride apps, hands off to them,
and stays resident in the background (no store deep-link, no `exit(0)`). Installed-app
detection via `installed_apps`; Android 11+ needs `QUERY_ALL_PACKAGES` / `<queries>`.

Verified Android package ids (authoritative installed-check target):
- BOLT `ee.mtakso.client`
- SCB EASY `com.scb.phone`
- K PLUS (KBank) `com.kasikorn.retail.mbanking.wap`
- Bualuang mBanking (BBL) `com.bbl.mobilebanking`
- Krungthai NEXT (KTB) `ktbcs.netbank`
- TTB touch `com.TMBTOUCH.PRODUCTION`

URL schemes are community-reported and must be verified on-device.

## Getting started
```
flutter pub get
flutter analyze
flutter test
flutter run
```

## Structure
```
lib/
  core/        router, theme, l10n
  shared/      octagon_tile, dashboard_layout, splash
  features/    splash, dashboard, cost, location, bathroom, attractions, counter, bolt, banking, weather, settings
test/          unit + widget + integration
```

## Best-practice follow-ups (recommendations)

- **Octagon layout (fixed):** `DashboardLayout` positions each tile by its center on
  the 45°-ring; earlier it used the top-left corner so the 8 tiles clustered in the
  top-left quadrant. Verified by geometry + widget render; confirm visually on-device.
- **Accessibility (Task 11.4):** `OctagonTile` now exposes a labelled `Semantics`
  button (`isButton`, `label`) with the inner `Text` excluded from the semantics tree
  so screen readers announce each tile once (TalkBack / VoiceOver). Covered by
  `test/features/dashboard_test.dart` (`OctagonTile exposes a tappable semantics button`).
- **CI release gate (Task 11.5):** `.github/workflows/ci.yml` now runs
  `flutter build apk --release` after analyze + tests, so a broken release build fails
  CI instead of only the local `flutter run`.
- **Thai font (on-device check, Risk Table #9):** `flutter_localizations` + the
  platform Roboto/Noto fallback render Thai; tofu glyphs were never observed in the
  simulator. Before tagging a release, verify Thai strings on a real Android + iOS
  device (Settings + all 8 tiles). If any tile shows boxes, bundle a Thai font
  (e.g. Noto Sans Thai) under `pubspec.yaml` `fonts:` and reference it in
  `lib/core/theme/app_theme.dart`.

## Verified gate
```bash
flutter pub get
flutter analyze --no-fatal-infos
flutter test
flutter build apk --release
# Linux desktop (needs libsecret-1-dev + a project path WITHOUT quotes):
flutter build linux
```

## Linux desktop build note (verified 2026-08-11)
`flutter build linux` needs the system package `libsecret-1-dev`
(required by `flutter_secure_storage_linux`). Install it:
```bash
sudo apt-get install -y libsecret-1-dev
```
The project directory path must **not** contain literal `"` characters — Flutter
generates `linux/flutter/ephemeral/generated_config.cmake` embedding the path in a
CMake quoted string, and the embedded quotes break `file(TO_CMAKE_PATH …)` (fatal
"must be called with exactly three arguments"). Spaces are fine; double-quotes are not.
