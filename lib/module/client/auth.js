"use strict";

import { IdviaApiError, safeJson } from './errors';
const EXPIRY_MARGIN_MS = 30_000;
export class TokenManager {
  token = null;
  expiresAt = 0;
  inFlight = null;
  constructor(tokenUrl, clientId, clientSecret, now = Date.now) {
    this.tokenUrl = tokenUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.now = now;
  }
  async getToken(force = false) {
    if (!force && this.token && this.now() < this.expiresAt - EXPIRY_MARGIN_MS) {
      return this.token;
    }
    if (!this.inFlight) {
      this.inFlight = this.fetchToken().finally(() => {
        this.inFlight = null;
      });
    }
    return this.inFlight;
  }
  async fetchToken() {
    const body = 'grant_type=client_credentials' + `&client_id=${encodeURIComponent(this.clientId)}` + `&client_secret=${encodeURIComponent(this.clientSecret)}`;
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    if (!res.ok) {
      // Never include the request body (it holds the secret) in the error.
      throw new IdviaApiError('Token request failed', res.status, this.tokenUrl, await safeJson(res));
    }
    const data = await res.json();
    this.token = data.access_token;
    this.expiresAt = this.now() + data.expires_in * 1000;
    return this.token;
  }
}
//# sourceMappingURL=auth.js.map