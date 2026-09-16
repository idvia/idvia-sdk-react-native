import type { IdviaError, IdviaResult } from '../shared/types';
export interface PortalRequest {
    url: string;
    landingUrl: string;
    landingKoUrl?: string;
    onDone: (result: IdviaResult) => void;
    onError: (error: IdviaError) => void;
}
/** Called by IdviaPortal on mount; returns an unregister function. */
export declare function registerPortal(fn: (request: PortalRequest | null) => void): () => void;
export declare function presentInPortal(request: PortalRequest): boolean;
//# sourceMappingURL=portal.d.ts.map