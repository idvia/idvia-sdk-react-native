import * as React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type IdviaError, type IdviaNavigationEvent, type IdviaResult } from '../shared/types';
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
    /** Default true. Auto-grant camera/mic to the page. Set false for Sign-only screens. */
    mediaPermissions?: boolean;
    /** Default 30000. First load exceeding this fires onError TIMEOUT. */
    loadTimeoutMs?: number;
    style?: StyleProp<ViewStyle>;
    /** Escape hatch: spread last onto the underlying WebView. */
    webViewProps?: Record<string, unknown>;
}
export declare function IdviaSession(props: IdviaSessionProps): React.JSX.Element;
//# sourceMappingURL=IdviaSession.d.ts.map