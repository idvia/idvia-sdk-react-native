export type TrustCloudOutcome = 'success' | 'failure' | 'cancel';
export interface TrustCloudResult {
    outcome: TrustCloudOutcome;
    /** The full URL that was intercepted, including query string. */
    landingUrl?: string;
    /** Parsed query params from the landing URL (advisory — confirm server-side). */
    params?: Record<string, string>;
}
export type TrustCloudErrorCode = 'LOAD_FAILED' | 'PERMISSION_DENIED' | 'INVALID_URL' | 'TIMEOUT' | 'WEBVIEW_UNSUPPORTED' | 'BROWSER_UNSUPPORTED' | 'PORTAL_NOT_MOUNTED';
export interface TrustCloudError {
    code: TrustCloudErrorCode;
    message: string;
    nativeError?: unknown;
}
export declare function makeError(code: TrustCloudErrorCode, message: string, nativeError?: unknown): TrustCloudError;
export interface TrustCloudNavigationEvent {
    url: string;
    loading: boolean;
    canGoBack: boolean;
}
//# sourceMappingURL=types.d.ts.map