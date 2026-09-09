import type { TrustCloudError, TrustCloudResult } from '../shared/types';
import { type OpenTrustCloudSessionOptions } from './openTrustCloudSession';
export type TrustCloudSessionStatus = 'idle' | 'presenting' | 'success' | 'failure' | 'cancel' | 'error';
export declare function useTrustCloudSession(): {
    status: TrustCloudSessionStatus;
    result: TrustCloudResult | null;
    error: TrustCloudError | null;
    present: (options: OpenTrustCloudSessionOptions) => Promise<TrustCloudResult>;
};
//# sourceMappingURL=useTrustCloudSession.d.ts.map