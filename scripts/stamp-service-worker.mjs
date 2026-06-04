import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const shellFiles = [
  "index.html",
  "favicon-96x96.png",
  "favicon.ico",
  "apple-touch-icon.png",
  "site.webmanifest",
  "web-app-manifest-192x192.png",
  "web-app-manifest-512x512.png",
  "assets/tilted-hero-mark.png",
  "assets/tilted-logo.png",
];

const hash = createHash("sha256");
for (const relativePath of shellFiles) {
  hash.update(relativePath);
  hash.update(readFileSync(join(dist, relativePath)));
}

const cacheVersion = hash.digest("hex").slice(0, 12);
const swPath = join(dist, "sw.js");
const serviceWorker = readFileSync(swPath, "utf8");
const stamped = serviceWorker.replaceAll("__CACHE_VERSION__", cacheVersion);

if (stamped === serviceWorker) {
  throw new Error("dist/sw.js is missing the __CACHE_VERSION__ placeholder.");
}

writeFileSync(swPath, stamped);
console.log(`Stamped service worker cache ${cacheVersion}.`);
