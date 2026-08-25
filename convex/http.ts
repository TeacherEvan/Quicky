import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { getCorsHeaders } from "./weather";
import { reverseHandler } from "./geocode";
import { placesHandler } from "./places";
import { weatherHandler } from "./weather";

/**
 * HTTP router for the three public proxy endpoints plus CORS preflight
 * routes. All shared helpers (CORS, rate limit, validation, logging)
 * live in `./weather` to keep the module graph acyclic:
 *
 *   http.ts → weather.ts (helpers + weatherHandler)
 *           → places.ts → weather.ts
 *           → geocode.ts → weather.ts
 *
 * If the helpers lived in this file, weather.ts / places.ts / geocode.ts
 * would import from `./http` (for helpers) and http.ts would import the
 * handlers from them, forming a cycle that breaks the Convex bundler.
 */

const optionsHandler = httpAction(async (_ctx, request) => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
});

const http = httpRouter();

http.route({
  path: "/api/weather",
  method: "GET",
  handler: weatherHandler,
});
http.route({
  path: "/api/weather",
  method: "OPTIONS",
  handler: optionsHandler,
});

http.route({
  path: "/api/places",
  method: "GET",
  handler: placesHandler,
});
http.route({
  path: "/api/places",
  method: "OPTIONS",
  handler: optionsHandler,
});

http.route({
  path: "/api/reverse",
  method: "GET",
  handler: reverseHandler,
});
http.route({
  path: "/api/reverse",
  method: "OPTIONS",
  handler: optionsHandler,
});

export default http;
