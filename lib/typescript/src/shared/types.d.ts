export type IdviaOutcome = 'success' | 'failure' | 'cancel';
export interface IdviaResult {
    outcome: IdviaOutcome;
    /** The full URL that was intercepted, including query string. */
    landingUrl?: string;
    /** Parsed query params from the landing URL (advisory — confirm server-side). */
    params?: Record<string, string>;
}
export type IdviaErrorCode = 'LOAD_FAILED' | 'PERMISSION_DENIED' | 'INVALID_URL' | 'TIMEOUT' | 'WEBVIEW_UNSUPPORTED' | 'BROWSER_UNSUPPORTED' | 'PORTAL_NOT_MOUNTED';
export interface IdviaError {
    code: IdviaErrorCode;
    message: string;
    nativeError?: unknown;
}
export declare function makeError(code: IdviaErrorCode, message: string, nativeError?: unknown): IdviaError;
export interface IdviaNavigationEvent {
    url: string;
    loading: boolean;
    canGoBack: boolean;
}
//# sourceMappingURL=types.d.ts.map