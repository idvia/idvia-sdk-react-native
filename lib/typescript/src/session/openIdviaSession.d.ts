import { type IdviaResult } from '../shared/types';
export interface OpenIdviaSessionOptions {
    url: string;
    landingUrl: string;
    landingKoUrl?: string;
    /** 'webview' (default) needs <IdviaPortal /> at the app root. */
    mode?: 'in-app-browser' | 'webview';
}
export declare function resultFromRedirect(redirectUrl: string, landingUrl: string, landingKoUrl?: string): IdviaResult;
export declare function openIdviaSession(options: OpenIdviaSessionOptions): Promise<IdviaResult>;
//# sourceMappingURL=openIdviaSession.d.ts.map