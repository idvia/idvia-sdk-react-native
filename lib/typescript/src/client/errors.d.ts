export declare class TrustCloudApiError extends Error {
    readonly status: number;
    readonly endpoint: string;
    readonly body?: unknown;
    constructor(message: string, status: number, endpoint: string, body?: unknown);
}
/** Best-effort error-body capture: parsed JSON, raw text, or undefined. */
export declare function safeJson(res: Response): Promise<unknown>;
//# sourceMappingURL=errors.d.ts.map