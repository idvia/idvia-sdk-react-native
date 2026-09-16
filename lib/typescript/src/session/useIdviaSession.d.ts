import type { IdviaError, IdviaResult } from '../shared/types';
import { type OpenIdviaSessionOptions } from './openIdviaSession';
export type IdviaSessionStatus = 'idle' | 'presenting' | 'success' | 'failure' | 'cancel' | 'error';
export declare function useIdviaSession(): {
    status: IdviaSessionStatus;
    result: IdviaResult | null;
    error: IdviaError | null;
    present: (options: OpenIdviaSessionOptions) => Promise<IdviaResult>;
};
//# sourceMappingURL=useIdviaSession.d.ts.map