# Quicky 🏃 — Recommended Stack & Architecture

## Flutter Stack (Production-Ready)

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Flutter 3.24+ (Dart 3.5+) | Stable, performant, single codebase iOS/Android |
| **State** | Riverpod 2.5+ | Compile-safe, testable, no context needed |
| **Navigation** | GoRouter 14+ | Declarative, deep links, web-ready |
| **DI/Service Locator** | Riverpod providers | Built-in, no extra dep |
| **Local Storage** | shared_preferences 2.3+ | Simple key-value, cross-platform |
| **Secure Storage** | flutter_secure_storage 9+ | API keys, tokens (encrypted) |
| **Camera** | camera 0.11+ | Full control, preview, capture |
| **Image Picker** | image_picker 1.1+ | Gallery + camera unified |
| **Location** | geolocator 12+ + geocoding 3+ | Permissions, GPS, reverse geocode |
| **Network** | dio 5.7+ | Interceptors, retries, timeout |
| **Weather API** | OpenWeatherMap / WeatherAPI | Free tier, global coverage |
| **Places/Attractions** | Google Places (paid) or OSM/Overpass (free) | Start with OSM/Overpass API (no key) |
| **App Launch** | url_launcher 6.2+ | Universal links, custom schemes |
| **i18n** | flutter_localizations + intl + arb | Official, compile-time safety |
| **Theme** | Material 3 (MaterialColorScheme) | Adaptive, dynamic color |
| **Lint** | very_good_analysis | Strict, used by Flutter team |
| **Testing** | Mocktail (unit), integration_test (e2e) | Modern, maintained |
| **CI** | GitHub Actions + subosito/flutter-action | Standard, cached |

---

## Architecture: Clean + Feature-First

```
lib/
├── main.dart                    # ProviderScope + GoRouter
├── core/
│   ├── router/app_router.dart   # All routes
│   ├── theme/app_theme.dart     # Light/dark, colors
│   ├── l10n/                    # ARB files (en, th)
│   └── utils/                   # Extensions, helpers
├── shared/
│   └── widgets/                 # OctagonTile, DashboardLayout, Splash
├── features/
│   ├── splash/                  # Startup animation
│   ├── dashboard/               # Octagon dashboard (8 tiles)
│   ├── cost/                    # Camera → Thai "How much?"
│   ├── location/                # Camera/Gallery → Thai "Where?"
│   ├── bathroom/                # 🚻 <swipe> 🚽 toggle
│   ├── attractions/             # Radius filters + places
│   ├── counter/                 # Day countdown
│   ├── bolt/                    # Launch BOLT app
│   ├── banking/                 # Launch banking apps
│   ├── weather/                 # Current + forecast
│   └── settings/                # Central hub (8 sections)
└── l10n/                        # Generated localizations
```

Each feature follows:
```
features/<name>/
├── <name>_page.dart          # UI
├── <name>_controller.dart    # Riverpod state
├── services/                 # External APIs
├── widgets/                  # Feature-specific widgets
└── models/                   # Data classes
```

---

## Key Implementation Details

### Octagon Dashboard Layout
```dart
// 8 tiles at 45° intervals around center
final positions = List.generate(8, (i) {
  final angle = (i * 45 - 90) * pi / 180; // -90° = top
  return Offset(cos(angle) * radius, sin(angle) * radius);
});
```
Center = Settings button (circular, larger).

### Thai Translations (ARB)
```json
// app_th.arb
"costQuestion": "สิ่งนี้ราคาเท่าไหร่?",
"locationQuestion": "สถานที่นี้อยู่ที่ไหน?",
"bathroomMale": "ชาย",
"bathroomFemale": "หญิง",
"attractionsMyArea": "บริเวณของฉัน",
"attractions10km": "10 กม.",
"attractions40km": "40 กม.",
"attractions100km": "100 กม.",
"dayCounterLabel": "วันนับถอยหลัง",
"boltLabel": "BOLT",
"bankingLabel": "ธนาคาร",
"weatherLabel": "สภาพอากาศ"
```

### App Launchers (URL Schemes)

> **Deep-link caveat (verified 2026-08-11):** Thai banking / cab apps do NOT publish official URL schemes.
> Scheme values are community-reported and MUST be verified on-device at implementation time.
> The **Android package id** column is verified against the Play Store and is the reliable fallback target.

| App | Android package (verified) | Scheme (community — verify on-device) | iOS (community) |
|---|---|---|---|
| BOLT | `ee.mtakso.client` | `boltd://` | `boltd://` |
| SCB Easy | `com.scb.phone` | `scb://` | `scbeasy://` |
| K PLUS (KBank) | `com.kasikorn.retail.mbanking.wap` | `kbank://` | `kplus://` |
| Bualuang mBanking (BBL) | `com.bbl.mobilebanking` | `bbl://` | `bualuang://` |
| Krungthai NEXT (KTB) | `ktbcs.netbank` | `ktb://` | `ktb://` |
| TTB touch | `com.TMBTOUCH.PRODUCTION` | `ttb://` | `ttb://` |

**Launcher contract:** installed-app-only (check package presence; if absent show "Not installed", do NOT link to store), background-resident launch (Flag `NEW_TASK` + `TASK_ON_HOME` on Android; iOS scheme keeps Quicky in recents), permission-gated (`QUERY_ALL_PACKAGES` / `<queries>` on Android 11+). Schemes are unverified community values; the Android package id is the authoritative installed-check target.

### Settings Persistence
| Setting | Storage |
|---|---|
| Theme, language, tile density | `shared_preferences` |
| Weather API key, banking toggles | `flutter_secure_storage` |
| Day counter target date | `shared_preferences` |
| Bathroom preference | `shared_preferences` |
| Attractions default radius | `shared_preferences` |

---

## Development Workflow

```bash
# Setup
flutter create --org com.teacherevan --project-name quicky --platforms=ios,android .
flutter pub get

# Dev
flutter run -d <device_id>

# Test
flutter analyze
flutter test --coverage

# Build
flutter build apk --release
flutter build ios --release --no-codesign
```

---

## First 3 Tasks to Start

1. **Task 0.1**: `flutter create` + `pubspec.yaml` with all deps
2. **Task 0.2**: GitHub Actions CI
3. **Task 1.1**: `main.dart` with Riverpod + GoRouter + splash route

---

**Ready to execute Task 0.1?** I'll create the Flutter project with the full `pubspec.yaml` and initialize git.