import type { TrustCloudError, TrustCloudResult } from '../shared/types';
export interface PortalRequest {
    url: string;
    landingUrl: string;
    landingKoUrl?: string;
    onDone: (result: TrustCloudResult) => void;
    onError: (error: TrustCloudError) => void;
}
/** Called by TrustCloudPortal on mount; returns an unregister function. */
export declare function registerPortal(fn: (request: PortalRequest | null) => void): () => void;
export declare function presentInPortal(request: PortalRequest): boolean;
//# sourceMappingURL=portal.d.ts.map