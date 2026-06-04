const target = new URL(process.argv[2] ?? process.env.TILTED_AUDIT_URL ?? "https://tilted.mrhallsclass.com");
const origin = target.origin;
const failures = [];
const warnings = [];

async function fetchPath(path, init) {
  const url = new URL(path, origin);
  const response = await fetch(url, init);
  return { url, response };
}

function requireHeader(headers, name) {
  if (!headers.get(name)) {
    failures.push(`Missing ${name} header on ${origin}/`);
  }
}

function requireIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    failures.push(`${label} is missing ${expected}`);
  }
}

const { response: rootResponse } = await fetchPath("/");
if (!rootResponse.ok) {
  failures.push(`${origin}/ returned HTTP ${rootResponse.status}`);
}
for (const header of [
  "content-security-policy",
  "permissions-policy",
  "referrer-policy",
  "x-content-type-options",
  "x-frame-options",
]) {
  requireHeader(rootResponse.headers, header);
}

const hsts = rootResponse.headers.get("strict-transport-security") ?? "";
if (/preload/i.test(hsts)) {
  warnings.push("HSTS preload is enabled; confirm every relevant subdomain is permanently HTTPS-ready.");
}

const html = await rootResponse.text();
requireIncludes(html, `property="og:url" content="${origin}"`, "root HTML");
requireIncludes(html, `content="${origin}/assets/tilted-cover.png"`, "root HTML");

const { response: healthResponse } = await fetchPath("/healthz");
const healthText = await healthResponse.text();
if (!healthResponse.ok || healthText.trim() !== "ok") {
  failures.push(`/healthz returned HTTP ${healthResponse.status} with body ${JSON.stringify(healthText)}`);
}

const { response: serviceWorkerResponse } = await fetchPath("/sw.js", { method: "HEAD" });
if (!serviceWorkerResponse.ok) {
  failures.push(`/sw.js returned HTTP ${serviceWorkerResponse.status}`);
}
const swCacheControl = serviceWorkerResponse.headers.get("cache-control") ?? "";
const hasFreshnessPolicy = /(?:^|,\s*)(no-cache|no-store|must-revalidate|max-age=0)(?:\s|,|$)/i.test(
  swCacheControl,
);
const hasLongMaxAge = /max-age=(?!0\b)\d+/i.test(swCacheControl);
if (!hasFreshnessPolicy || hasLongMaxAge) {
  failures.push(`/sw.js should be uncached or revalidated promptly; observed Cache-Control: ${swCacheControl || "(missing)"}`);
}

for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}

if (failures.length > 0) {
  console.error("Production audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Production audit passed for ${origin}.`);
}
