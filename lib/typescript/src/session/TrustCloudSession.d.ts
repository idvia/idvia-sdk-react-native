import * as React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type TrustCloudError, type TrustCloudNavigationEvent, type TrustCloudResult } from '../shared/types';
export interface TrustCloudSessionProps {
    /** Session URL created via TrustCloudClient or your backend. */
    url: string;
    /** Navigation to this URL fires onSuccess. */
    landingUrl: string;
    /** Navigation to this URL fires onFailure. Checked before landingUrl. */
    landingKoUrl?: string;
    onSuccess?: (result: TrustCloudResult) => void;
    onFailure?: (result: TrustCloudResult) => void;
    onCancel?: () => void;
    onError?: (error: TrustCloudError) => void;
    onNavigationEvent?: (event: TrustCloudNavigationEvent) => void;
    renderLoading?: () => React.ReactElement;
    /** Default true. Auto-grant camera/mic to the page. Set false for Sign-only screens. */
    mediaPermissions?: boolean;
    /** Default 30000. First load exceeding this fires onError TIMEOUT. */
    loadTimeoutMs?: number;
    style?: StyleProp<ViewStyle>;
    /** Escape hatch: spread last onto the underlying WebView. */
    webViewProps?: Record<string, unknown>;
}
export declare function TrustCloudSession(props: TrustCloudSessionProps): React.JSX.Element;
//# sourceMappingURL=TrustCloudSession.d.ts.map