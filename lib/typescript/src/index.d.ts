export { IdviaClient } from './client/IdviaClient';
export { IdviaApiError } from './client/errors';
export { ENVIRONMENT_URLS } from './client/environments';
export type { IdviaEnvironment, IdviaUrls } from './client/environments';
export type { CreateSignParams, CreateSignResult, CreateSignSessionParams, CreateSignSessionResult, CreateVideoIdAssistedParams, CreateVideoIdAssistedResult, CreateVideoIdResult, CreateVideoIdUnassistedParams, GetSignUrlParams, SignDocument, SignSigner, SignStatusParams, SignStatusResult, IdviaClientConfig, IdviaUseCaseIds, VideoIdAssistedStatusParams, VideoIdUnassistedStatusParams, } from './client/types';
export { IdviaSession } from './session/IdviaSession';
export type { IdviaSessionProps } from './session/IdviaSession';
export { SignSession, VideoIdAssistedSession, VideoIdUnassistedSession } from './session/aliases';
export { IdviaPortal } from './session/IdviaPortal';
export { openIdviaSession } from './session/openIdviaSession';
export type { OpenIdviaSessionOptions } from './session/openIdviaSession';
export { useIdviaSession } from './session/useIdviaSession';
export type { IdviaSessionStatus } from './session/useIdviaSession';
export { matchLanding } from './session/matchLanding';
export { makeError } from './shared/types';
export type { IdviaError, IdviaErrorCode, IdviaNavigationEvent, IdviaOutcome, IdviaResult, } from './shared/types';
//# sourceMappingURL=index.d.ts.map