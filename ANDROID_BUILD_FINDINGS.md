# Android APK Build — Findings (2026-08-13, RESOLVED)

Goal: produce an installable Android APK for Quicky (mobile app for phone).

## RESULT: ✅ APK BUILT
- Path: `/home/ewaldt/Documents/VS/Other/Quicky! -No TIME to talk!/Quicky/build/app/outputs/flutter-apk/app-release.apk`
- Size: 53.6 MB, valid Android package (verified via `file`).
- Build command (must run from a path WITHOUT spaces or `!`):
  ```
  cd /tmp/quicky_build   # copy of the project, safe path
  flutter build apk --release
  ```

## ROOT CAUSE (the thing that actually blocked everything)
The project folder is named `Quicky! -No TIME to talk!` — it contains a **space and a `!`**.
The `!` triggers bash history expansion and the space breaks unquoted paths. The Kotlin
Gradle compiler runner fails with:
```
e: java.io.FileNotFoundException: /home/ewaldt/Documents/VS/Other/Quicky! -No TIME to talk (No such file or directory)
```
This is why EVERY `flutter build apk` from the real path failed with "Internal compiler error"
— the compiler could not open source files, NOT a Kotlin version problem.

FIX: build from a copy at a safe path (`/tmp/quicky_build`, no spaces/`!`). The APK is
identical regardless of build location.

## Secondary issues found + addressed (so the safe-path build is clean)
1. Android toolchain missing cmdline-tools + licenses → installed cmdline-tools, accepted licenses. `flutter doctor` Android now ✅.
2. `android/gradle.properties`: kept `android.newDsl=false` + `android.builtInKotlin=false`
   (Flutter 3.44.9 has not migrated to AGP 9 new DSL; built-in Kotlin conflicts with the
   pre-AGP-9 plugins camera_android_camerax / image_picker_android).
3. `android/settings.gradle.kts`: removed the external `org.jetbrains.kotlin.android` 2.3.20
   pin (was forcing an incompatible Kotlin).
4. `android/app/build.gradle.kts`: removed the manual `kotlin { compilerOptions }` block.
5. `android/build.gradle.kts`: added a scoped `buildscript` resolutionStrategy forcing
   `org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.0` (Flutter 3.44.9's bundled version) for
   subproject classpaths. This scopes to the Quicky build only and does NOT touch Flutter's
   own flutter_tools/gradle (which needs kotlin-dsl 6.2.0 / Kotlin 2.2.x).

NOTE: the "Kotlin version (2.2.10)" warning persists but is HARMLESS once the path bug is
gone — the build succeeds. It is a Flutter advisory about plugins applying KGP; not a blocker.

## How to install on your phone
No USB device detected at build time. Two options:
A) USB: enable Developer Options + USB debugging, plug in, then:
   `adb install "/home/ewaldt/Documents/VS/Other/Quicky! -No TIME to talk!/Quicky/build/app/outputs/flutter-apk/app-release.apk"`
B) Manual: copy the APK to the phone (USB/Bluetooth/email), open it on the phone, enable
   "Install unknown apps" for the source, tap Install.

## Recommendation (prevents future pain)
Rename the project folder to remove spaces and `!`, e.g.
`~/Documents/VS/Quicky` — then builds work from the real path and no /tmp copy is needed.
Git: the repo can be `git mv`'d or re-cloned at the new path.

## Files changed (uncommitted, android only)
- `android/gradle.properties`
- `android/settings.gradle.kts`
- `android/app/build.gradle.kts`
- `android/build.gradle.kts` (scoped Kotlin force)

## Not mobile-related (separate context)
- Linux desktop binary builds but shows NO window on this Wayland host (Flutter GTK/Wayland
  embedder bug). Workaround: `flutter run -d chrome` + `run_quicky.sh` launcher.
- `master` branch previously had duplicate `pubspec.yaml` keys (CI `flutter pub get` failure,
  PR #4). Separate `master` corruption, not part of this APK work.
