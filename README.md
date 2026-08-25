# Quicky

A pure Next.js webapp for travelers in Thailand. Eight tools in one PWA,
all wired to **real APIs — no mocks, no sample data, no fake fallbacks**.

- **Cost** — Take a photo of a price tag. OCR runs **in your browser**
  (Tesseract.js, no upload, no API key). Recognised text is translated to
  Thai via MyMemory (free, anonymous, 5000 chars/day; add
  `NEXT_PUBLIC_TRANSLATE_EMAIL` to lift the quota).
- **Location** — Upload a photo with GPS metadata. The real coordinates
  are sent to OpenStreetMap Nominatim via your Convex backend. If the
  image has no EXIF GPS, the UI tells you — no fake "Bangkok" default.
- **Weather** — Browser geolocation (or pick Bangkok) → Convex
  `/api/weather` → real Open-Meteo. If the call fails, the UI shows the
  error.
- **Attractions** — Browser geolocation → Convex `/api/places` → real
  Overpass. Empty result = "No attractions found", not a fake list.
- **Bolt** — `boltd://home` URL scheme launcher. Only works where the
  app is installed; the UI says so.
- **Banking** — 6 Thai banks, each with its known community-reported
  scheme. Tap to open.
- **Bathroom** — local toggle, persisted in localStorage.
- **Day Counter** — pick a future date, see days remaining, all local.
- **Settings** — theme / language / units, persisted in localStorage.

## Architecture

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, plain CSS
  (no Tailwind, no design system rot).
- **Backend**: Convex httpActions in `convex/` — pure proxies for
  Open-Meteo, Nominatim and Overpass with CORS. No database. The
  Convex code is the same one as before, kept intact.
- **Hosting**: Vercel. The `vercel.json` drives build + SPA rewrite +
  PWA manifest/icon cache headers.

## Local dev

```bash
cp .env.local.example .env.local  # or use the existing .env.local
npm ci
npm run dev                       # http://localhost:3000
```

## Deploy

Vercel project → Root = `.` → Framework = Next.js. Set
`NEXT_PUBLIC_CONVEX_SITE_URL` to your Convex site URL.

The Convex backend itself is `npx convex dev` (or `npx convex deploy`
for prod). The code in `convex/` is real, no mocks.

## Verification gate

```bash
npm ci
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # next build
npm run smoke       # scripts/smoke.mjs
```

The smoke script boots `next start`, hits every tile route, and probes
the live Convex `/api/weather` and `/api/places` endpoints.

## What was removed

This repo used to ship a Flutter app (iOS / Android / Linux / macOS /
Windows + web). That whole scaffold — `lib/`, `test/`, `android/`,
`ios/`, `linux/`, `macos/`, `windows/`, `pubspec.*`, `.dart_tool/`,
the `startup.mp4` splash — is gone. The only thing kept from that era
is the Convex backend (`convex/`), which is real, not a mock, and was
the only piece doing useful work.

## What is intentionally NOT here

- **Mocks of any kind.** If a real API call fails, the UI shows the
  error. There is no `_mockSnapshot`, no `_mockList`, no `isMock: true`
  flag, no "data not available — showing sample" disclosure.
- **Bundled splash video.** It was 3 seconds of branding on a 720x720
  canvas. The Next.js app opens directly on the dashboard.
- **iOS / Android / desktop shells.** Quicky is a webapp.
