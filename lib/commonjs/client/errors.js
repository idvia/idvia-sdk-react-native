"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrustCloudApiError = void 0;
exports.safeJson = safeJson;
class TrustCloudApiError extends Error {
  constructor(message, status, endpoint, body) {
    super(message);
    this.name = 'TrustCloudApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.body = body;
  }
}

/** Best-effort error-body capture: parsed JSON, raw text, or undefined. */
exports.TrustCloudApiError = TrustCloudApiError;
async function safeJson(res) {
  try {
    const text = await res.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    // some environments (and test doubles) only implement json()
    try {
      return await res.json();
    } catch {
      return undefined;
    }
  }
}
//# sourceMappingURL=errors.js.map