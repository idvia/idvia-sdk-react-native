export declare class TokenManager {
    private readonly tokenUrl;
    private readonly clientId;
    private readonly clientSecret;
    private readonly now;
    private token;
    private expiresAt;
    private inFlight;
    constructor(tokenUrl: string, clientId: string, clientSecret: string, now?: () => number);
    getToken(force?: boolean): Promise<string>;
    private fetchToken;
}
//# sourceMappingURL=auth.d.ts.map