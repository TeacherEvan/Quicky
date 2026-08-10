# Quicky 🏃 — Flutter App Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a production-ready Flutter (iOS/Android) app "Quicky" — an octagon-dashboard shortcut utility with 8 tiles: Cost Translator (camera + Thai), Location Finder (camera + Thai + load image), Bathroom Toggle, Attractions (distance filters), Day Counter, Bolt Launcher, Banking Launcher, Weather — plus central Settings with proactive best-practice configs.

**Architecture:** Clean Architecture + Riverpod state management. Each tile is an independent feature module. Platform channels for native intents (camera, app launchers). Local-first with optional cloud sync. Offline-capable by default.

**Tech Stack:**
- Flutter 3.24+ (Dart 3.5+)
- Riverpod 2.5+ (state)
- GoRouter 14+ (navigation)
- flutter_camera 0.11+ (camera)
- image_picker 1.1+ (gallery)
- geolocator 12+ / geocoding 3+ (location)
- weather_openweathermap or similar (weather)
- shared_preferences 2.3+ (local persistence)
- url_launcher 6.2+ (external app launch)
- flutter_localizations + intl (Thai/English i18n)
- very_good_analysis (lint)
- Mocktail (unit tests), integration_test (e2e)

---

## Task 0: Repository Setup & CI

### Task 0.1: Initialize Flutter project
**Files:**
- Create: `pubspec.yaml` (with all deps above)
- Create: `analysis_options.yaml` (very_good_analysis)
- Create: `.gitignore` (Flutter standard)
- Create: `README.md` (project overview)

**Commands:**
```bash
flutter create --org com.teacherevan --project-name quicky --platforms=ios,android .
flutter pub get
flutter analyze
```
**Expected:** Clean analyze, no errors.

### Task 0.2: CI Pipeline
**Files:**
- Create: `.github/workflows/ci.yml`

**Content:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.24', channel: 'stable' }
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage
      - run: flutter build apk --debug
```

**Gate:** `flutter analyze` = 0 errors, `flutter test` = all pass.

---

## Task 1: Core Architecture & Shared

### Task 1.1: App entry + routing
**Files:**
- Create: `lib/main.dart` (Riverpod ProviderScope, GoRouter)
- Create: `lib/core/router/app_router.dart` (routes: /, /settings, /cost, /location, /bathroom, /attractions, /counter, /weather)

### Task 1.2: Theme & i18n
**Files:**
- Create: `lib/core/theme/app_theme.dart` (light/dark, Material 3, octagon-friendly colors)
- Create: `lib/core/l10n/app_localizations.dart` (ARB: en, th)
- Create: `lib/l10n/app_en.arb`, `lib/l10n/app_th.arb`

### Task 1.3: Shared widgets
**Files:**
- Create: `lib/shared/widgets/octagon_tile.dart` (clippath octagon, tap ripple, icon + label)
- Create: `lib/shared/widgets/dashboard_layout.dart` (center settings button, 8 tiles in octagon formation using Stack + Positioned with trigonometry)
- Create: `lib/shared/widgets/loading_splash.dart` (startup animation: logo + progress)

---

## Task 2: Startup & Dashboard

### Task 2.1: Startup splash screen
**Files:**
- Create: `lib/features/splash/splash_page.dart` (animated logo, 2s min, then pushReplacement to /)
- Modify: `lib/main.dart` (initialRoute: /splash)

### Task 2.2: Dashboard screen (octagon)
**Files:**
- Create: `lib/features/dashboard/dashboard_page.dart` (uses DashboardLayout, 8 OctagonTiles)
- Create: `lib/features/dashboard/dashboard_controller.dart` (Riverpod provider for tile order/visibility)

**Tile definitions (data-driven):**
```dart
const tiles = [
  TileDef(id: 'cost', icon: Icons.attach_money, label: 'Cost?', route: '/cost'),
  TileDef(id: 'location', icon: Icons.location_on, label: 'Location?', route: '/location'),
  TileDef(id: 'bathroom', icon: Icons.wc, label: 'Bathrooms', route: '/bathroom'),
  TileDef(id: 'attractions', icon: Icons.explore, label: 'Attractions', route: '/attractions'),
  TileDef(id: 'counter', icon: Icons.timer, label: 'Day Counter', route: '/counter'),
  TileDef(id: 'bolt', icon: Icons.flash_on, label: 'BOLT', route: '/bolt'),
  TileDef(id: 'banking', icon: Icons.account_balance, label: 'Banking', route: '/banking'),
  TileDef(id: 'weather', icon: Icons.wb_sunny, label: 'Weather', route: '/weather'),
];
```

---

## Task 3: Feature — Cost Translator (Tile 1)

### Task 3.1: Cost page + camera
**Files:**
- Create: `lib/features/cost/cost_page.dart` (CameraPreview, capture button, result card)
- Create: `lib/features/cost/cost_controller.dart` (Riverpod: camera state, captured image, translation text)

### Task 3.2: Thai translation string
**Files:**
- Modify: `lib/l10n/app_th.arb` add: `"costQuestion": "สิ่งนี้ราคาเท่าไหร่?"`
- Modify: `lib/l10n/app_en.arb` add: `"costQuestion": "How much does this cost?"`

### Task 3.3: Result UI
**Files:**
- Create: `lib/features/cost/widgets/cost_result_card.dart` (Image + Thai phrase + English + copy button)
- Camera permission handled via `permission_handler` (add to pubspec)

---

## Task 4: Feature — Location Finder (Tile 2)

### Task 4.1: Location page + camera/gallery
**Files:**
- Create: `lib/features/location/location_page.dart` (CameraPreview + "Load Image" button + result)
- Create: `lib/features/location/location_controller.dart` (image source enum, captured/picked image)

### Task 4.2: Thai location phrase
**Files:**
- Modify ARB: `"locationQuestion": "สถานที่นี้อยู่ที่ไหน?"` / `"Where is this place?"`

### Task 4.3: Reverse geocode (optional enhancement)
**Files:**
- Create: `lib/features/location/services/geocode_service.dart` (geocoding from image EXIF or manual)
- If EXIF GPS exists → auto-fetch address → show Thai + English

---

## Task 5: Feature — Bathrooms (Tile 3)

### Task 5.1: Bathroom toggle page
**Files:**
- Create: `lib/features/bathroom/bathroom_page.dart` (Centered toggle: 🚻 <swipe> 🚽)
- Create: `lib/features/bathroom/bathroom_controller.dart` (Riverpod: bool isMale, animated switcher)

### Task 5.2: Persist preference
**Files:**
- Use `shared_preferences` to save last selection

---

## Task 6: Feature — Attractions (Tile 4)

### Task 6.1: Attractions page + location request
**Files:**
- Create: `lib/features/attractions/attractions_page.dart` (SegmentedButton: My Area / 10km / 40km / 100km)
- Create: `lib/features/attractions/attractions_controller.dart` (radius state, location permission, places list)

### Task 6.2: Places API integration
**Files:**
- Create: `lib/features/attractions/services/places_service.dart` (Google Places / OpenStreetMap / Foursquare — pick one)
- Mock implementation first (YAGNI — real API key in Settings)

### Task 6.3: List UI
**Files:**
- Create: `lib/features/attractions/widgets/attraction_card.dart` (name, distance, type, open now)

---

## Task 7: Feature — Day Counter (Tile 5)

### Task 7.1: Counter page
**Files:**
- Create: `lib/features/counter/counter_page.dart` (TextField "Enter days", big countdown display, Reset button)
- Create: `lib/features/counter/counter_controller.dart` (target date, tick every second, persist to shared_preferences)

### Task 7.2: Background tick
**Files:**
- Use `flutter_background_service` or simple `Timer.periodic` (app alive only)

---

## Task 8: Feature — App Launchers (Tiles 6 & 7)

### Task 8.1: Bolt launcher
**Files:**
- Create: `lib/features/bolt/bolt_page.dart` (single button "Launch BOLT")
- Create: `lib/features/bolt/bolt_service.dart` (url_launcher: `boltd://` or Android intent `com.bolt.app` / iOS URL scheme)

### Task 8.2: Banking launcher
**Files:**
- Create: `lib/features/banking/banking_page.dart` (list of known Thai banks with icons → launch)
- Create: `lib/features/banking/banking_service.dart` (map: SCB → `scb://`, KBank → `kbank://`, etc.)

### Task 8.3: Fallback
**Files:**
- If scheme fails → open Play Store / App Store page

---

## Task 9: Feature — Weather (Tile 8)

### Task 9.1: Weather page
**Files:**
- Create: `lib/features/weather/weather_page.dart` (current + 3-day forecast, location-based)
- Create: `lib/features/weather/weather_controller.dart` (location permission, auto-refresh)

### Task 9.2: Weather service
**Files:**
- Create: `lib/features/weather/services/weather_service.dart` (OpenWeatherMap / WeatherAPI — API key from Settings)
- Mock first, real key configurable in Settings

---

## Task 10: Settings (Center Hub)

### Task 10.1: Settings page + navigation
**Files:**
- Create: `lib/features/settings/settings_page.dart` (ListView sections)
- Create: `lib/features/settings/settings_controller.dart` (Riverpod: all settings state)

### Task 10.2: Proactive/Practical Settings Sections
**Files:**
- Create: `lib/features/settings/sections/` (each a widget)

**Sections:**
1. **Appearance**: Theme (system/light/dark), Tile density (comfortable/compact), Language (EN/TH)
2. **Location**: Default radius (10/40/100km), Auto-fetch on open, High-accuracy toggle
3. **Camera**: Default source (camera/gallery), Image quality, Auto-save to gallery
4. **App Launchers**: Bolt scheme override, Banking apps enable/disable per bank
5. **Weather**: Provider (OpenWeather/WeatherAPI), API key input (masked), Units (C/F), Refresh interval
6. **Day Counter**: Notification at 0, Sound, Vibration
7. **Privacy**: Analytics opt-out, Crash reporting, Clear all local data
8. **About**: Version, Licenses, Report issue (mailto)

### Task 10.3: Persist all settings
**Files:**
- Use `shared_preferences` + `flutter_secure_storage` for API keys

---

## Task 11: Testing & Polish

### Task 11.1: Unit tests (per feature)
**Files:** `test/features/<feature>/<feature>_controller_test.dart`
**Gate:** `flutter test` — 100% pass

### Task 11.2: Widget tests (dashboard, tiles)
**Files:** `test/features/dashboard/`, `test/shared/widgets/`

### Task 11.3: Integration test (happy path)
**Files:** `integration_test/app_test.dart` (launch → dashboard → tap tile → result)

### Task 11.4: Accessibility
**Verify:** Semantics labels, contrast, font scaling, TalkBack/VoiceOver

### Task 11.5: Build release
```bash
flutter build apk --release
flutter build ios --release
```

---

## Verification Checklist (per task)
- [ ] `flutter analyze` = 0 errors
- [ ] `flutter test` = all pass
- [ ] Feature works on Android + iOS sim
- [ ] Thai/EN strings render correctly
- [ ] Settings persist across restart
- [ ] No hardcoded strings (all ARB)
- [ ] Commit after each task

---

## Execution Order
```
0.1 → 0.2 → 1.1 → 1.2 → 1.3 → 2.1 → 2.2 →
3.1 → 3.2 → 3.3 → 4.1 → 4.2 → 4.3 →
5.1 → 5.2 → 6.1 → 6.2 → 6.3 →
7.1 → 7.2 → 8.1 → 8.2 → 8.3 →
9.1 → 9.2 → 10.1 → 10.2 → 10.3 →
11.1 → 11.2 → 11.3 → 11.4 → 11.5
```

---

**Ready to execute.** Shall I proceed with Task 0.1?