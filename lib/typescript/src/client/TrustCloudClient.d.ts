import type { CreateVideoIdAssistedParams, CreateVideoIdAssistedResult, CreateVideoIdResult, CreateVideoIdUnassistedParams, TrustCloudClientConfig, CreateSignParams, CreateSignResult, CreateSignSessionParams, CreateSignSessionResult, GetSignUrlParams, VideoIdAssistedStatusParams, VideoIdUnassistedStatusParams, SignStatusParams, SignStatusResult } from './types';
export declare class TrustCloudClient {
    private readonly urls;
    private readonly useCaseIds;
    private readonly auth;
    constructor(config: TrustCloudClientConfig);
    createVideoIdUnassisted(params: CreateVideoIdUnassistedParams): Promise<CreateVideoIdResult>;
    createVideoIdAssisted(params: CreateVideoIdAssistedParams): Promise<CreateVideoIdAssistedResult>;
    createSign(params: CreateSignParams): Promise<CreateSignResult>;
    getSignUrl(params: GetSignUrlParams): Promise<{
        url: string;
    }>;
    createSignSession(params: CreateSignSessionParams): Promise<CreateSignSessionResult>;
    getVideoIdUnassistedStatus(params: VideoIdUnassistedStatusParams): Promise<Record<string, unknown>>;
    getVideoIdAssistedStatus(params: VideoIdAssistedStatusParams): Promise<Record<string, unknown>>;
    getSignStatus(params: SignStatusParams): Promise<SignStatusResult>;
    private resolveUseCaseId;
    private request;
}
//# sourceMappingURL=TrustCloudClient.d.ts.map