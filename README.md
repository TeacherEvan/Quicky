# Quicky 🏃

A Flutter (iOS/Android) octagon-dashboard shortcut utility for travelers in Thailand.
One central hub + 8 tiles: Cost Translator, Location Finder, Bathroom Toggle, Attractions,
Day Counter, Bolt Launcher, Banking Launcher, Weather.

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
flutter analyze
flutter test
flutter build apk --release
```
