"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdviaClient = void 0;
var _auth = require("./auth");
var _environments = require("./environments");
var _errors = require("./errors");
class IdviaClient {
  constructor(config) {
    const presets = _environments.ENVIRONMENT_URLS[config.environment];
    this.urls = {
      ...presets,
      ...config.urls
    };
    this.useCaseIds = config.useCaseIds ?? {};
    this.auth = new _auth.TokenManager(this.urls.identityServer + _environments.TOKEN_PATHS[config.environment], config.clientId, config.clientSecret);
  }
  async createVideoIdUnassisted(params) {
    const {
      useCaseId,
      landingUrl,
      landingKoUrl,
      configuration,
      ...rest
    } = params;
    const id = this.resolveUseCaseId('videoIdUnassisted', useCaseId);
    const raw = await this.request('POST', `/api/v1/videoIdUnassisted/useCase/${encodeURIComponent(id)}/createUnassisted`, {
      ...rest,
      // The API requires a nested configuration object; the landing URLs live inside it.
      configuration: {
        ...configuration,
        landingURL: landingUrl,
        ...(landingKoUrl !== undefined ? {
          landingKoUrl
        } : {})
      }
    });
    return {
      url: raw.url,
      trustCloudFileId: raw.trustCloudFileId,
      videoIdentificationId: raw.videoIdentificationId
    };
  }
  async createVideoIdAssisted(params) {
    const {
      useCaseId,
      ...rest
    } = params;
    const id = this.resolveUseCaseId('videoIdAssisted', useCaseId);
    const raw = await this.request('POST', `/api/v2/videoid/usecaseid/${encodeURIComponent(id)}/create`, rest);
    // Some deployments return the session URL as a plain string instead of
    // the documented JSON object — no ids are available in that case.
    if (typeof raw === 'string') {
      return {
        url: raw
      };
    }
    return {
      url: raw.url,
      trustCloudFileId: raw.trustCloudFileId,
      // the assisted API returns 'videoidentificationId' (lowercase i) — normalize it
      videoIdentificationId: raw.videoIdentificationId ?? raw.videoidentificationId
    };
  }
  async createSign(params) {
    const {
      useCaseId,
      ...rest
    } = params;
    const id = this.resolveUseCaseId('sign', useCaseId);
    const raw = await this.request('POST', `/api/v1/sign/useCase/${encodeURIComponent(id)}/create`, rest);
    return {
      trustCloudFileId: raw.trustCloudFileId
    };
  }
  async getSignUrl(params) {
    const id = this.resolveUseCaseId('sign', params.useCaseId);
    const raw = await this.request('GET', `/api/v1/sign/useCase/${encodeURIComponent(id)}/trustCloudFile/${encodeURIComponent(params.trustCloudFileId)}/${encodeURIComponent(params.identityClientReference)}/url`);
    // the signing URL is returned in the 'message' field — unwrap it
    return {
      url: raw.message
    };
  }
  async createSignSession(params) {
    const {
      identityClientReference,
      ...createParams
    } = params;
    const firstSigner = params.signers[0];
    const signerRef = identityClientReference ?? firstSigner?.clientReference ?? firstSigner?.id;
    if (!signerRef) {
      throw new _errors.IdviaApiError('createSignSession needs at least one signer (or an explicit identityClientReference)', 0, '');
    }
    const {
      trustCloudFileId
    } = await this.createSign(createParams);
    const {
      url
    } = await this.getSignUrl({
      useCaseId: params.useCaseId,
      trustCloudFileId,
      identityClientReference: signerRef
    });
    return {
      url,
      trustCloudFileId
    };
  }
  async getVideoIdUnassistedStatus(params) {
    const id = this.resolveUseCaseId('videoIdUnassisted', params.useCaseId);
    return this.request('GET', `/api/v1/videoIdUnassisted/useCase/${encodeURIComponent(id)}/trustCloudFile/${encodeURIComponent(params.trustCloudFileId)}/videoIdentification/${encodeURIComponent(params.videoIdentificationId)}/getVideoIdentification`);
  }
  async getVideoIdAssistedStatus(params) {
    const id = this.resolveUseCaseId('videoIdAssisted', params.useCaseId);
    return this.request('GET', `/api/v2/videoid/usecaseid/${encodeURIComponent(id)}/trustcloudfileid/${encodeURIComponent(params.trustCloudFileId)}/status`);
  }
  async getSignStatus(params) {
    const id = this.resolveUseCaseId('sign', params.useCaseId);
    return this.request('GET', `/api/v1/sign/useCase/${encodeURIComponent(id)}/trustCloudFile/${encodeURIComponent(params.trustCloudFileId)}/status`);
  }
  resolveUseCaseId(flow, override) {
    const id = override ?? this.useCaseIds[flow];
    if (!id) {
      throw new _errors.IdviaApiError(`No useCaseId configured for '${flow}' — pass useCaseId or set useCaseIds.${flow} in the client config`, 0, '');
    }
    return id;
  }
  async request(method, path, body) {
    const doFetch = token => fetch(this.urls.orchestrator + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? {
          'Content-Type': 'application/json'
        } : {})
      },
      ...(body !== undefined ? {
        body: JSON.stringify(body)
      } : {})
    });
    let res = await doFetch(await this.auth.getToken());
    if (res.status === 401) {
      res = await doFetch(await this.auth.getToken(true));
    }
    if (!res.ok) {
      throw new _errors.IdviaApiError(`Idvia request failed: ${method} ${path} → ${res.status}`, res.status, path, await (0, _errors.safeJson)(res));
    }
    // Tolerate non-JSON success bodies (some endpoints return plain text).
    try {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch {
      // some environments (and test doubles) only implement json()
      return await res.json();
    }
  }
}
exports.IdviaClient = IdviaClient;
//# sourceMappingURL=IdviaClient.js.map