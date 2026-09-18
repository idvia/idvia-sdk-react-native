import * as React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type IdviaError, type IdviaNavigationEvent, type IdviaResult } from '../shared/types';
/**
 * Hosts the embedded flow is allowed to navigate to in the main frame, besides the
 * hosts of `url`, `landingUrl` and `landingKoUrl`. Anything else is opened in the
 * system browser instead of inside the WebView, so a page reached through a link or
 * an open redirect never runs with the camera/microphone grants this component gives.
 */
export declare const DEFAULT_ALLOWED_HOSTS: readonly string[];
export interface IdviaSessionProps {
    /** Session URL created via IdviaClient or your backend. */
    url: string;
    /** Navigation to this URL fires onSuccess. */
    landingUrl: string;
    /** Navigation to this URL fires onFailure. Checked before landingUrl. */
    landingKoUrl?: string;
    onSuccess?: (result: IdviaResult) => void;
    onFailure?: (result: IdviaResult) => void;
    onCancel?: () => void;
    onError?: (error: IdviaError) => void;
    onNavigationEvent?: (event: IdviaNavigationEvent) => void;
    renderLoading?: () => React.ReactElement;
    /**
     * Default true. Auto-grant camera/mic to the page (iOS: only to the page's own host;
     * Android grants to any page the WebView loads, so the host allowlist is what limits it).
     * Set false for Sign-only screens: on iOS the grant is denied outright.
     */
    mediaPermissions?: boolean;
    /**
     * Extra hosts the main frame may navigate to inside the WebView (exact host or
     * `*.example.com`). Added to `DEFAULT_ALLOWED_HOSTS` and to the hosts of `url` and the
     * landing URLs. Main-frame navigation to any other host is blocked and handed to the
     * system browser.
     */
    allowedHosts?: readonly string[];
    /** Default 30000. First load exceeding this fires onError TIMEOUT. */
    loadTimeoutMs?: number;
    style?: StyleProp<ViewStyle>;
    /**
     * Escape hatch spread onto the underlying WebView. Security-relevant props are NOT
     * overridable: `javaScriptEnabled`, `originWhitelist`, `mixedContentMode`,
     * `mediaCapturePermissionGrantType`. `onShouldStartLoadWithRequest` and
     * `injectedJavaScriptBeforeContentLoaded` are composed with the SDK's own (yours runs
     * first; a `false` from yours blocks the load; your script runs after the SDK's shim).
     */
    webViewProps?: Record<string, unknown>;
}
export declare function IdviaSession(props: IdviaSessionProps): React.JSX.Element;
//# sourceMappingURL=IdviaSession.d.ts.map