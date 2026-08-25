#!/usr/bin/env node
/**
 * Quicky smoke gate. Runs against a built `next start` server on port 8098
 * and probes the live Convex backend. No mocks.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = Number(process.env.SMOKE_PORT ?? 8098);
const SITE = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
if (!SITE) {
  console.error("NEXT_PUBLIC_CONVEX_SITE_URL must be set");
  process.exit(1);
}

let server;
try {
  console.log(`▶ Starting next start on :${PORT}…`);
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NEXT_PUBLIC_CONVEX_SITE_URL: SITE },
  });
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      // not up yet
    }
  }
  if (!ready) {
    throw new Error("next start did not become ready in 30s");
  }
  console.log("✔ next start responding 200 on /");

  for (const path of ["/", "/weather", "/attractions", "/cost", "/location", "/counter", "/bathroom", "/bolt", "/banking", "/settings", "/manifest.json"]) {
    const code = (await fetch(`http://127.0.0.1:${PORT}${path}`)).status;
    if (code !== 200 && code !== 404) {
      throw new Error(`GET ${path} -> ${code}`);
    }
    console.log(`✔ ${path} -> ${code}`);
  }

  const weather = await fetch(
    `${SITE}/api/weather?lat=13.7563&lng=100.5018&units=C`,
  );
  if (!weather.ok) throw new Error(`Convex weather ${weather.status}`);
  const w = await weather.json();
  if (typeof w.tempC !== "number") throw new Error("weather response missing tempC");
  console.log(`✔ convex /api/weather live: ${JSON.stringify(w)}`);

  const places = await fetch(
    `${SITE}/api/places?lat=13.7563&lng=100.5018&radius=10`,
  );
  if (!places.ok) throw new Error(`Convex places ${places.status}`);
  const p = await places.json();
  if (!Array.isArray(p.places)) throw new Error("places.places not an array");
  console.log(`✔ convex /api/places live: ${p.places.length} places`);

  console.log("SMOKE PASS");
} catch (e) {
  console.error("✖", e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
} finally {
  if (server && !server.killed) server.kill("SIGTERM");
}
