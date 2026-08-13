**Status:** ✅ **Archived — Implemented & Verified** (Aug 2026)

# Quicky 🏃 — Flutter App Implementation Plan

> **For Hermes:** Execute task-by-task (subagent or inline). Greenfield app — no remote feature flag.

**Goal:** Build a production-ready Flutter (iOS/Android) app "Quicky" — an octagon-dashboard shortcut utility with 8 tiles: Cost Translator (camera + Thai), Location Finder (camera + Thai + load image), Bathroom Toggle, Attractions (distance filters), Day Counter, Bolt Launcher, Banking Launcher, Weather — plus central Settings with proactive best-practice configs.

**Architecture:** Clean Architecture + Riverpod state management. Each tile is an independent feature module. Platform channels / `url_launcher` for native intents (camera, app launchers). Local-first with optional cloud sync. Offline-capable by default.

**Tech Stack:**
- Flutter 3.24+ (Dart 3.5+)
- Riverpod 2.5+ (state)
- GoRouter 14+ (navigation)
- camera ^0.11.0 (native preview/capture)
- image_picker 1.1+ (gallery)
- geolocator 12+ / geocoding 3+ (location)
- weather_openweathermap or similar (weather)
- shared_preferences 2.3+ (local persistence)
- flutter_secure_storage 9+ (API keys / tokens)
- url_launcher 6.2+ (external app launch)
- installed_apps 1.6+ (enumerate + launch installed apps; Android 11+ needs QUERY_ALL_PACKAGES)
- permission_handler 11+ (camera / location runtime grants)
- flutter_localizations + intl (Thai/English i18n)
- very_good_analysis (lint)
- Mocktail (unit tests), integration_test (e2e)

**Effort:** ~3 weeks | **Surfaces touched:** 1 app (`lib/`) | **New tables:** 0 (local-first) | **Feature flag:** n/a (standalone app; gated by route + build flavor)

---

## Milestone Timeline

Ship in slices; each milestone compiles and is independently reviewable. Nothing is shipped to users until Milestone 4's release build.

### Milestone 1: Scaffold & Core (Tasks 0–1)
Flutter project, CI, routing, theme, i18n, shared octagon widgets. No features user-visible yet.
- `pubspec.yaml`, `analysis_options.yaml`, CI, `lib/main.dart`, `core/*`, `shared/widgets/*`

### Milestone 2: Dashboard & Splash (Task 2)
Octagon dashboard renders 8 tiles; splash gates entry.
- `features/splash`, `features/dashboard`

### Milestone 3: Feature Tiles (Tasks 3–9)
Each tile independently compilable; camera / location / launcher / weather behind permission + settings.
- `cost`, `location`, `bathroom`, `attractions`, `counter`, `bolt`, `banking`, `weather`

### Milestone 4: Settings Hub & Verification (Tasks 10–11)
Central settings persists all prefs; full unit/widget/integration tests, a11y pass, release build.

---

## Data Flow

Solid `─►` = request/response; dashed `╌►` = async external API or OS intent.

### Tile → Result
```
User tap OctagonTile
   │
   ▼
GoRouter push /<route>
   │
   ▼
<Feature>Page (reads Riverpod controller)
   ├─ camera/gallery ─► image ─► (optional) Thai phrase overlay
   ├─ location ─╌► geolocator ─╌► places/weather API (key from settings)
   └─ launcher ─╌► url_launcher scheme/intent ─╌► external app
   │
   ▼
Result card / state ─► shared_preferences (secure storage for keys)
```

### Settings persistence
```
SettingsPage ─► settings_controller (Riverpod)
   ├─ simple prefs ─► shared_preferences
   └─ secrets (weather key, bank toggles) ─► flutter_secure_storage
```

---

## Mockups

### A · Octagon dashboard (8 tiles @ 45°, center = Settings)
```
            [ Cost? ]
   [Location?]       [Bathrooms]
[Bathroom]   ( ⚙ Settings )   [Attract]
  [DayCnt]       [Weather]
   [ BOLT ]         [Banking]
```
### B · Tile result card (Cost Translator)
```
┌──────────────────────────────┐
│ [captured image thumbnail]   │
│ TH: สิ่งนี้ราคาเท่าไหร่?        │
│ EN: How much does this cost? │
│                 [ Copy ]     │
└──────────────────────────────┘
```

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
- Create: `lib/features/bolt/bolt_service.dart` (installed-app check via `installed_apps`; launch verified package `ee.mtakso.client` with background-resident intent; show "Not installed" if absent)

### Task 8.2: Banking launcher
**Files:**
- Create: `lib/features/banking/banking_page.dart` (list of known Thai banks with icons → launch)
- Create: `lib/features/banking/banking_service.dart` (installed-app check via `installed_apps`; per-bank verified package map; launch only if present with background-resident intent; "Not installed" state otherwise)

> **Launcher contract (verified 2026-08-11 + user clarification):**
> Users are international. Quicky must only trigger the *already-installed* designated
> banking / ride app, hand off to it, and keep Quicky resident in the background (not
> finish/close). It must request the relevant permission (e.g. `QUERY_ALL_PACKAGES` on
> Android 11+ to enumerate installed apps) and only offer to launch apps that are present.
>
> - **Installed-only:** at runtime, check the target package is installed. If absent,
>   show "Not installed" and do NOT deep-link to the store (per user: only trigger the
>   app that already exists). No forced install.
> - **Background-resident launch:** use Android `Intent` with `FLAG_ACTIVITY_NEW_TASK`
>   + `Intent.FLAG_ACTIVITY_TASK_ON_HOME` so the external app opens while Quicky stays
>   in the recents stack; on iOS `launchUrl` of the scheme keeps Quicky in the background
>   by default. Do not call `SystemNavigator.pop()` / `exit(0)`.
> - **Permission-gated:** Android 11+ needs `QUERY_ALL_PACKAGES` (or fine-grained
>   `<queries>` entries) to see other apps. Prompt / explain the need in Settings.
> - **Schemes are unverified:** banks/cab apps publish no official URL schemes; the
>   scheme column is community-reported and MUST be verified on-device. The **Android
>   package id** (Play Store–verified) is the authoritative installed-check target.

**Verified Android package ids (Play Store, 2026-08-11):**

| App | Android package (verified) | Scheme (community — verify on-device) |
|---|---|---|
| BOLT | `ee.mtakso.client` | `boltd://` |
| SCB EASY | `com.scb.phone` | `scb://` / `scbeasy://` |
| K PLUS (KBank) | `com.kasikorn.retail.mbanking.wap` | `kbank://` / `kplus://` |
| Bualuang mBanking (BBL) | `com.bbl.mobilebanking` | `bbl://` |
| Krungthai NEXT (KTB) | `ktbcs.netbank` | `ktb://` |
| TTB touch | `com.TMBTOUCH.PRODUCTION` | `ttb://` |

**Implementation approach:**
- Android: use `url_launcher`'s Android `intent://` with `package=<verified id>` so the
  OS opens that specific installed app; `canLaunchUrl` / `Intent.resolveActivity` confirms
  presence first.
- iOS: attempt the community scheme; if `canLaunchUrl` is false, show "Not installed".

### Task 8.3: Fallback
**Files:**
- If the designated app is NOT installed → show inline "Not installed" state; do NOT
  navigate to the Play Store / App Store (per user requirement: only trigger existing apps).

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

## Risk Table

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Deep-link scheme wrong / app won't open | High | Medium | Use verified Play Store package id for the `intent://...package=` target; verify schemes on-device before release |
| Target app not installed → launch fails | Medium | Low | Installed-only: check package presence first; show "Not installed" state, never deep-link to store |
| Android 11+ can't see installed apps (`QUERY_ALL_PACKAGES` denied) | Medium | Medium | Request the permission / use fine-grained `<queries>`; if denied, offer manual bank selection in Settings |
| Background app killed when handing off | Low | Medium | Use `FLAG_ACTIVITY_NEW_TASK` + `TASK_ON_HOME`; never call `SystemNavigator.pop()` / `exit(0)`; verify via recents stack on device |
| Installed-app-detection package name unverified | Medium | Medium | Use a verified package (e.g. `installed_apps` / `device_apps`) — confirm current pub.dev name at implementation time; do not hardcode until verified |
| Camera / location permission denied | Medium | Medium | Graceful empty state; re-prompt via `permission_handler`; document in Settings |
| iOS custom URL scheme blocked (no universal link) | Medium | Medium | Attempt scheme; if `canLaunchUrl` false show "Not installed"; note in release checklist |
| Weather / Places API key missing | Medium | Low | Use mock service until key entered in Settings; no crash |
| Thai font not bundled → tofu glyphs | Low | Medium | Include Thai font in `pubspec.yaml` fonts; render test on device |
| `camera` + `image_picker` both requested → redundant capture paths | Low | Low | Prefer `camera` for live preview; `image_picker` only for gallery |
| Release build fails code signing (iOS) | Medium | High | Build `--no-codesign` in CI; signing only on maintained profile |

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
