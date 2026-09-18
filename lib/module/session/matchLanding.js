"use strict";

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
export function matchLanding(url, landingUrl) {
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
export function parseQueryParams(url) {
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

/** Lower-cased host of an absolute URL (without userinfo or port), or null. */
export function hostOf(url) {
  const parsed = normalize(url);
  if (!parsed) return null;
  // normalize() keeps userinfo and port in host; strip both so `a@b:443` cannot fool the match
  const afterUserinfo = parsed.host.slice(parsed.host.lastIndexOf('@') + 1);
  return afterUserinfo.replace(/:\d+$/, '');
}

/**
 * Whether `host` matches one of `patterns`: an exact host, or `*.example.com` which
 * matches `example.com` and every subdomain of it.
 */
export function isHostAllowed(host, patterns) {
  const h = host.toLowerCase();
  return patterns.some(raw => {
    const p = raw.trim().toLowerCase();
    if (!p) return false;
    if (p.startsWith('*.')) {
      const apex = p.slice(2);
      return h === apex || h.endsWith('.' + apex);
    }
    return h === p;
  });
}
export function isValidHttpsUrl(url) {
  const parsed = normalize(url);
  return parsed !== null && parsed.scheme === 'https';
}
//# sourceMappingURL=matchLanding.js.map