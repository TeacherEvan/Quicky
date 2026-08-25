import { httpRouter } from "convex/server";

import { reverseHandler } from "./geocode";
import { placesHandler } from "./places";
import { weatherHandler } from "./weather";

const http = httpRouter();

http.route({
  path: "/api/weather",
  method: "GET",
  handler: weatherHandler,
});

http.route({
  path: "/api/places",
  method: "GET",
  handler: placesHandler,
});

http.route({
  path: "/api/reverse",
  method: "GET",
  handler: reverseHandler,
});

export default http;
