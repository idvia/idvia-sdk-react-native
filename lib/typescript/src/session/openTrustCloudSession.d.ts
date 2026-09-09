import { type TrustCloudResult } from '../shared/types';
export interface OpenTrustCloudSessionOptions {
    url: string;
    landingUrl: string;
    landingKoUrl?: string;
    /** 'webview' (default) needs <TrustCloudPortal /> at the app root. */
    mode?: 'in-app-browser' | 'webview';
}
export declare function resultFromRedirect(redirectUrl: string, landingUrl: string, landingKoUrl?: string): TrustCloudResult;
export declare function openTrustCloudSession(options: OpenTrustCloudSessionOptions): Promise<TrustCloudResult>;
//# sourceMappingURL=openTrustCloudSession.d.ts.map