"use strict";

// ── API client ──
export { IdviaClient } from './client/IdviaClient';
export { IdviaApiError } from './client/errors';
export { ENVIRONMENT_URLS } from './client/environments';
// ── Rendering ──
export { IdviaSession, DEFAULT_ALLOWED_HOSTS } from './session/IdviaSession';
export { SignSession, VideoIdAssistedSession, VideoIdUnassistedSession } from './session/aliases';
export { IdviaPortal } from './session/IdviaPortal';
export { openIdviaSession } from './session/openIdviaSession';
export { useIdviaSession } from './session/useIdviaSession';
export { matchLanding } from './session/matchLanding';

// ── Shared types ──
export { makeError } from './shared/types';
//# sourceMappingURL=index.js.map