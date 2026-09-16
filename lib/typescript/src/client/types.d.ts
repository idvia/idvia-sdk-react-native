import type { IdviaEnvironment, IdviaUrls } from './environments';
export interface IdviaUseCaseIds {
    videoIdUnassisted?: string;
    videoIdAssisted?: string;
    sign?: string;
}
export interface IdviaClientConfig {
    environment: IdviaEnvironment;
    clientId: string;
    clientSecret: string;
    useCaseIds?: IdviaUseCaseIds;
    /** Escape hatch overriding the environment presets. */
    urls?: Partial<IdviaUrls>;
}
/**
 * The API's nested `configuration` object — mandatory on the create call.
 * Landing URLs, expiry and all verification tuning live here, not top-level.
 */
export interface VideoIdUnassistedConfiguration {
    saveVideoRecording?: boolean;
    /** Language code: 'EN', 'ES', 'FR', … */
    language?: string;
    landingURL?: string;
    landingKoUrl?: string;
    otpBefore?: boolean;
    otpDuring?: boolean;
    preCallTest?: boolean;
    checkMrz?: boolean;
    manualSnapshot?: boolean;
    useDocumentVerificationEngine?: boolean;
    usePassiveLifeLivenessEngine?: boolean;
    passiveLifeLivenessThreshold?: number;
    checkForFaceMatching?: boolean;
    faceMatchSimilarityThreshold?: number;
    useActiveLifeLivenessEngine?: boolean;
    slaExpirationSeconds?: number;
    slaExpirationAdviseSeconds?: number;
    videoAssistedInterconnection?: boolean;
    workflow?: string[];
    [key: string]: unknown;
}
/** Documented fields are typed; the index signature passes further top-level fields (docNumber, name, …) through. */
export interface CreateVideoIdUnassistedParams {
    useCaseId?: string;
    clientReference: string;
    /** Document type the user will present — mandatory in the API: 'Id', 'Passport', 'DriversLicense', … */
    docType: string;
    /** Mapped into configuration.landingURL. */
    landingUrl: string;
    /** Mapped into configuration.landingKoUrl. */
    landingKoUrl?: string;
    /** Extra configuration entries; landingUrl/landingKoUrl params take precedence over duplicates here. */
    configuration?: VideoIdUnassistedConfiguration;
    [key: string]: unknown;
}
export interface CreateVideoIdAssistedParams {
    useCaseId?: string;
    clientReference: string;
    /** ISO 3166-1 alpha-2 country code where the service is provided — mandatory in the API. */
    serviceCountry: string;
    /** ISO 639-1 alpha-2 language code — mandatory in the API. */
    language: string;
    /** Subject's first name — some use cases reject the call without it. */
    name?: string;
    /** Subject's surname(s) — some use cases reject the call without it. */
    surname?: string;
    landingUrl: string;
    [key: string]: unknown;
}
export interface CreateVideoIdResult {
    url: string;
    trustCloudFileId: string;
    videoIdentificationId: string;
}
/** Assisted deployments may return only the URL (plain-text response) — the ids are then absent. */
export interface CreateVideoIdAssistedResult {
    url: string;
    trustCloudFileId?: string;
    videoIdentificationId?: string;
}
/** Signer shape per the Sign API; all fields optional-typed, passthrough for the rest. */
export interface SignSigner {
    /** The signer's reference — also what getSignUrl's identityClientReference path segment expects. */
    clientReference?: string;
    name?: string;
    lastName?: string;
    documentNumber?: string;
    email?: string;
    mobile?: string;
    id?: string;
    order?: number;
    role?: 'SIGNER' | string;
    signMode?: string;
    authenticationMethod?: string;
    [key: string]: unknown;
}
export interface SignDocument {
    id?: string;
    url?: string;
    base64?: string;
    documentReference?: string;
    fileName?: string;
    [key: string]: unknown;
}
export interface CreateSignParams {
    useCaseId?: string;
    clientReference?: string;
    signers: SignSigner[];
    documents: SignDocument[];
    [key: string]: unknown;
}
export interface CreateSignResult {
    trustCloudFileId: string;
}
export interface GetSignUrlParams {
    useCaseId?: string;
    trustCloudFileId: string;
    identityClientReference: string;
}
export interface CreateSignSessionParams extends CreateSignParams {
    /** Which signer's URL to fetch. Defaults to the first signer. */
    identityClientReference?: string;
}
export interface CreateSignSessionResult {
    url: string;
    trustCloudFileId: string;
}
export interface VideoIdUnassistedStatusParams {
    useCaseId?: string;
    trustCloudFileId: string;
    videoIdentificationId: string;
}
export interface VideoIdAssistedStatusParams {
    useCaseId?: string;
    trustCloudFileId: string;
}
export interface SignStatusParams {
    useCaseId?: string;
    trustCloudFileId: string;
}
export interface SignStatusResult {
    status: 'Completed' | 'Pending' | 'Cancelled' | string;
    [key: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map