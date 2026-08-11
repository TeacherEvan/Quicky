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
