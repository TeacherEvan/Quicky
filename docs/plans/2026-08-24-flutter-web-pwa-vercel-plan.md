# Quicky — Flutter-web PWA + Convex + Vercel port plan

Date: 2026-08-24. Branch base: `feat/dashboard-tile-polish` (dirty tree preserved:
octagon_tile.dart staged; settings_sections.dart, loading_splash.dart,
pubspec.yaml/.lock modified — do not revert user edits).

## Goal
Same Flutter codebase ships as: installable PWA + link-runnable webapp on Vercel,
with a Convex backend powering real data for weather / attractions / reverse
geocode. All 8 tiles + settings hub work on web. Android/iOS/desktop builds keep
working.

## Ground truth (verified 2026-08-24)
- Flutter 3.44.9 / Dart 3.12.2 local — matches `sdk: ^3.12.2`.
- `web/` platform dir = stock template (manifest has 192/512 + maskable icons;
  wrong name/description/theme-color #0175C2 vs brand seed #5B3DF5).
- Web-hostile: `installed_apps` in bolt_service.dart:19, banking_service.dart:22.
- Mock-only services: weather_service.dart, places_service.dart, geocode_service.dart.
- Unused deps (no imports anywhere in lib/ or test/): camera, geolocator,
  geocoding, permission_handler. Used: image_picker (location_page.dart:4),
  flutter_secure_storage (settings_controller.dart:48,86 — supports web).
- CI gates: format → analyze → test --coverage → build apk. No web gate.
- Router: GoRouter central, initialLocation `/splash`, home `/`.

## Job graph

| # | Scope | Work | Gate |
|---|---|---|---|
| J1 | `web/`, settings | PWA shell: manifest/index.html rebrand (name, desc, theme_color #5B3DF5, apple-touch), beforeinstallprompt capture + "Install Quicky" UI in Settings | build web |
| J2 | bolt/banking services | kIsWeb branches: web assumes installed & launches scheme URLs (`boltd://home`, per-bank schemes) via externalApplication; page copy adjusted ("Open app") | analyze+test |
| J3 | convex/, lib/core/convex, weather/places/geocode services | Real no-key providers behind one client chain: Convex httpAction proxy+cache → direct API fallback → mock fallback. APIs: Open-Meteo (weather), Nominatim reverse (geocode), Overpass (places) — all CORS-enabled | dart analyze + unit tests w/ injected http Client |
| J4 | splash_page/loading_splash | Splash video plays once per browser session on web (sessionStorage flag); deep-link refresh lands directly on target route | widget test |
| J5 | vercel.json, ci.yml, README | vercel.json (build `flutter build web --release --dart-define=CONVEX_URL=…`, output build/web, SPA rewrites, headers for SW); CI adds web release build gate | CI green locally |
| J6 | pubspec.yaml | Surgical prune of 4 unused deps (verify again immediately before edit) | pub get + analyze + test + all builds |

## Contracts kept
- 8-tile dashboard, central router untouched (routes appended only in routes.dart).
- Launcher contract: installed-app-only on mobile; on web = best-effort scheme
  launch, never auto-link store.
- i18n fail-fast; new user-facing strings go through ARB (en/th).
- Settings API-key path stays (optional OpenWeather upgrade) — secure storage is
  web-capable.

## Deployment runbook (needs human auth)
1. `npx convex deploy` from repo root (login or CONVEX_DEPLOY_KEY).
2. Vercel project import: Root=`.`; env `CONVEX_URL=https://<dep>.convex.site`.
3. Post-deploy verify: link loads, manifest valid, Lighthouse installable,
   weather tile hits Convex.

## Verification gate (final)

```
dart format --output=none --set-exit-if-changed lib test
flutter analyze --no-fatal-infos
flutter test
flutter build web --release
flutter build apk --release   (regression)
```

## Status: IMPLEMENTED 2026-08-24 ✅

All gates green (format/analyze/21 tests/build web). J1–J6 done. Review fixes
applied: web launcher canLaunchUrl no-op (blocker), i18n keys into the real
`_bundles`, weather °F suffix via `WeatherSnapshot.tempF`, places empty→fallthrough.

Pre-existing (NOT caused by this port): local `flutter build apk --release`
fails on camera_android_camerax Kotlin compile w/ Gradle artifact download
errors — reproduced on clean HEAD. CI builds APK fine.

Follow-ups (review-identified, deferred):
- Convex proxies are open (no rate-limit/origin check) — add cheap throttle.
- Consider pass-through proxy + single Dart mapping layer (~50 lines dup).
- lib/l10n/*.arb are not wired to codegen; strings actually live in
  lib/core/l10n/app_localizations.dart `_bundles`. Wire gen-l10n or drop ARBs.
- pwa_shell_test: reset stub state between tests / make stub injectable.

