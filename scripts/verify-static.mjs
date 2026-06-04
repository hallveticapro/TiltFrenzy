import { accessSync, constants, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(root, path), "utf8");
const assertIncludes = (content, value, source) => {
  if (!content.includes(value)) {
    throw new Error(`${source} is missing ${value}`);
  }
};
const assertMatches = (content, pattern, source) => {
  if (!pattern.test(content)) {
    throw new Error(`${source} does not match ${pattern}`);
  }
};

const index = read("dist/index.html");
const serviceWorker = read("dist/sw.js");
const nginx = read("deploy/nginx.conf");
const staticHeaders = read("dist/_headers");
const vercel = read("vercel.json");

for (const [source, content] of [
  ["deploy/nginx.conf", nginx],
  ["dist/_headers", staticHeaders],
  ["vercel.json", vercel],
]) {
  for (const header of [
    "Content-Security-Policy",
    "Permissions-Policy",
    "Referrer-Policy",
    "X-Content-Type-Options",
    "X-Frame-Options",
  ]) {
    assertIncludes(content, header, source);
  }
}

assertIncludes(nginx, "location = /healthz", "deploy/nginx.conf");
assertMatches(serviceWorker, /const CACHE_NAME = "tilted-shell-[a-f0-9]{12}"/, "dist/sw.js");
assertIncludes(serviceWorker, "if (response.ok)", "dist/sw.js");
assertIncludes(serviceWorker, 'type === "SKIP_WAITING"', "dist/sw.js");
assertIncludes(index, 'property="og:image"', "dist/index.html");
assertIncludes(index, 'name="twitter:card"', "dist/index.html");
assertIncludes(index, 'property="og:url" content="https://', "dist/index.html");
assertIncludes(staticHeaders, "Cache-Control: no-cache, must-revalidate", "dist/_headers");
assertIncludes(vercel, '"Cache-Control", "value": "no-cache, must-revalidate"', "vercel.json");

if (index.includes("__TILTED_")) {
  throw new Error("dist/index.html still contains an unresolved social metadata placeholder");
}
if (index.includes("https://github.com/hallveticapro/Tilted")) {
  throw new Error("dist/index.html still points social metadata at the GitHub fallback URL");
}
if (serviceWorker.includes("__CACHE_VERSION__")) {
  throw new Error("dist/sw.js still contains an unresolved cache placeholder");
}

accessSync(join(root, "deploy/40-runtime-metadata.sh"), constants.X_OK);
console.log("Static bundle verification passed.");
