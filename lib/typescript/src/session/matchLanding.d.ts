/**
 * Prefix match on normalized scheme + host + path. Query string and fragment
 * are ignored; deeper paths only match on a path-segment boundary.
 */
export declare function matchLanding(url: string, landingUrl: string): boolean;
export declare function parseQueryParams(url: string): Record<string, string>;
/** Lower-cased host of an absolute URL (without userinfo or port), or null. */
export declare function hostOf(url: string): string | null;
/**
 * Whether `host` matches one of `patterns`: an exact host, or `*.example.com` which
 * matches `example.com` and every subdomain of it.
 */
export declare function isHostAllowed(host: string, patterns: readonly string[]): boolean;
export declare function isValidHttpsUrl(url: string): boolean;
//# sourceMappingURL=matchLanding.d.ts.map