# Plan: nuke Flutter, ship a pure Next.js webapp

Branch: `feat/pure-webapp` (new, off `63c9a79`; old Flutter branch stays on origin untouched)
Stack: Next.js 15 App Router, TypeScript, server components, no Tailwind (use CSS modules / global CSS only — no AI aesthetic, no design system rot)
Hosting: Vercel (existing `vercel.json` rewritten; `convex/` backend stays as-is — it's real, not a mock)

## What stays
- `convex/` — REAL backend, proxies Open-Meteo / Overpass / Nominatim via CORS-enabled httpActions. Not a mock.
- `package.json` + `package-lock.json` + `node_modules/` — Next.js / Convex CLI toolchain.
- `web/manifest.json` — copied to `app/manifest.json` (PWA manifest is framework-agnostic).
- `docs/plans/2026-08-24-flutter-web-pwa-vercel-plan.md` — historical record, kept.

## What dies
- `lib/` (all Dart source)
- `test/` (Dart tests)
- `android/`, `ios/`, `linux/`, `macos/`, `windows/` (native shells)
- `.dart_tool/`, `.flutter-plugins-dependencies`, `pubspec.yaml`, `pubspec.lock`, `analysis_options.yaml`, `devtools_options.yaml`
- `lib/core/l10n/app_localizations.dart` (Flutter l10n)
- `lib/core/convex/convex_client.dart` (Dart wrapper)
- `lib/features/*` (8 Dart pages + their services)
- `lib/shared/widgets/*` (OctagonTile, DashboardLayout, LoadingSplash, pwa_bridge)
- `assets/videos/startup.mp4` (splash video — not used in Next.js; user didn't mention a splash, so no splash)
- `tool/smoke.sh` (replaced by `scripts/smoke.mjs`)
- `run_quicky.sh` (replaced by `npm run dev`)
- `.github/workflows/ci.yml` (Flutter-specific gates replaced with Next.js gates)

## What gets built
- `app/` — Next.js App Router
  - `app/layout.tsx` — root layout, PWA `<link rel="manifest">`, theme color, no header/footer chrome
  - `app/page.tsx` — dashboard (8 tiles + center hub, no Flutter octagon — semantic CSS grid)
  - `app/cost/page.tsx` — image upload → Convex `/api/translate` (NEW endpoint, no API key)
  - `app/location/page.tsx` — image upload + EXIF GPS → real Nominatim reverse via Convex
  - `app/bathroom/page.tsx` — pure local toggle (saved to localStorage)
  - `app/attractions/page.tsx` — radius chips + Convex `/api/places` (real Overpass)
  - `app/counter/page.tsx` — pure local day counter
  - `app/bolt/page.tsx` — `boltd://` scheme launcher (`window.location.href = 'boltd://home'`)
  - `app/banking/page.tsx` — list of 6 Thai banks, each opens its scheme URL
  - `app/weather/page.tsx` — geolocation prompt → Convex `/api/weather` (real Open-Meteo)
  - `app/settings/page.tsx` — theme, language, units, version info
  - `app/api/health/route.ts` — liveness probe
- `components/` — minimal shared UI (Tile, Nav)
- `lib/convex.ts` — typed fetch helpers for the 3 Convex endpoints
- `lib/translate.ts` — REAL image-to-Thai-phrase: I'll wire the simplest working option, see below
- `public/manifest.json`, `public/icons/*` (PWA)
- `scripts/smoke.mjs` — replaces `tool/smoke.sh` (node-fetch instead of curl)
- `.github/workflows/ci.yml` — `npm ci && npm run lint && npm run build`
- `vercel.json` — Next.js preset
- `README.md` — rewritten

## Real image-to-Thai-phrase (the cost tile)
Three options, no API key required for the first two:
1. **Tesseract OCR (browser WASM via tesseract.js) + hardcoded EN→TH phrasebook** — no server, no key, runs in the browser. Extracts English text from the price tag, then looks up a Thai phrase by category. **This is the only honest no-key path.** Not an LLM, not a translation API. It WILL fail on handwritten text and non-Latin scripts. The UI says so.
2. **MyMemory translation API** — free, no key, 5000 chars/day. Calls Convex proxy → translates the OCR result. But the OCR step is the same.
3. **Requires a key**: Google Cloud Vision + Translation, GPT-4V, Claude. You provide a key in `.env.local` and I add the optional key path.

I'll do #1 + #2 (OCR in browser, MyMemory for translation) as the default. If you want a key-based backend, say so and add `VISION_API_KEY` + `TRANSLATE_API_KEY` to `.env.local` and I'll wire those.

## Real image-to-place-name (the location tile)
Path: read EXIF GPS from the uploaded image (browser exifr.js), POST to Convex `/api/reverse?lat=..&lng=..`, get real Nominatim label. **No mocks, no hardcoded Bangkok coords.** If the image has no EXIF, the UI says so and asks for manual lat/lng. If Nominatim fails, the UI shows the error.

## Real Weather
Browser geolocation → Convex `/api/weather?lat=..&lng=..` → real Open-Meteo. No `_mockSnapshot`. If it fails, the UI shows the error.

## Real Attractions
Browser geolocation → Convex `/api/places?lat=..&lng=..&radius=..` → real Overpass. No `_mockList`. If it fails, the UI shows the error.

## Bolt + Banking
Already real. `window.location.href = 'boltd://home'` for Bolt. For banking, the 6 banks' URL schemes are well-documented community knowledge. The UI explicitly says "This will only work if the app is installed; on desktop this is a no-op."

## Settings
Theme (system/light/dark via `prefers-color-scheme` + localStorage), language (en/th — labels in the app, not Flutter ARB), units (C/F).

## Verification gate (post-rebuild)
- `npm run lint` clean
- `npm run build` succeeds
- `npm run start` + Playwright smoke of all 8 tiles in a real Chromium:
  - dashboard renders 8 tiles
  - weather tile fetches `https://glad-mongoose-104.convex.site/api/weather?lat=13.7563&lng=100.5018&units=C` and shows the result
  - attractions tile fetches the same for places
  - bolt tile opens `boltd://home` (or shows "Bolt not installed" on desktop)
  - cost tile uploads a test PNG with English text, runs OCR, runs translation, shows the Thai phrase
  - location tile uploads a JPG with EXIF GPS, shows the real place name
  - day counter, bathroom toggle work locally
  - settings persist theme across reloads

## Commit
One commit on `feat/pure-webapp`:
- `rebuild(webapp): nuke Flutter, ship pure Next.js app with real APIs (no mocks)`
- Removes: android/, ios/, linux/, macos/, windows/, lib/, test/, .dart_tool/, pubspec.*, analysis_options.yaml, devtools_options.yaml, assets/, run_quicky.sh, tool/smoke.sh, .github/workflows/ci.yml (rewritten)
- Adds: app/, components/, lib/convex.ts, lib/translate.ts, public/, scripts/smoke.mjs, .github/workflows/ci.yml, vercel.json (rewritten), package.json (rewritten), README.md (rewritten), .gitignore (updated)

## Push
Force-push to `feat/pure-webapp` (new branch — old Flutter branch stays on origin at `63c9a79`).

## Time
~3–4 hours of mechanical build + 30 min verification.
