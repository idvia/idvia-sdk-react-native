"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidHttpsUrl = isValidHttpsUrl;
exports.matchLanding = matchLanding;
exports.parseQueryParams = parseQueryParams;
function normalize(raw) {
  const m = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^/?#]+)([^?#]*)/.exec(raw.trim());
  if (!m) return null;
  let path = m[3] || '/';
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return {
    scheme: m[1].toLowerCase(),
    host: m[2].toLowerCase(),
    path
  };
}

/**
 * Prefix match on normalized scheme + host + path. Query string and fragment
 * are ignored; deeper paths only match on a path-segment boundary.
 */
function matchLanding(url, landingUrl) {
  const visited = normalize(url);
  const landing = normalize(landingUrl);
  if (!visited || !landing) return false;
  if (visited.scheme !== landing.scheme || visited.host !== landing.host) return false;
  if (visited.path === landing.path) return true;
  const prefix = landing.path === '/' ? '/' : landing.path + '/';
  return visited.path.startsWith(prefix);
}
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
function parseQueryParams(url) {
  const query = url.split('#')[0].split('?')[1];
  if (!query) return {};
  const out = {};
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? '' : pair.slice(eq + 1);
    out[safeDecode(key)] = safeDecode(value);
  }
  return out;
}
function isValidHttpsUrl(url) {
  const parsed = normalize(url);
  return parsed !== null && parsed.scheme === 'https';
}
//# sourceMappingURL=matchLanding.js.map