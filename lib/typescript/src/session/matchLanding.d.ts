/**
 * Prefix match on normalized scheme + host + path. Query string and fragment
 * are ignored; deeper paths only match on a path-segment boundary.
 */
export declare function matchLanding(url: string, landingUrl: string): boolean;
export declare function parseQueryParams(url: string): Record<string, string>;
export declare function isValidHttpsUrl(url: string): boolean;
//# sourceMappingURL=matchLanding.d.ts.map