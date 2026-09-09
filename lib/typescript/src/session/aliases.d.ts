import * as React from 'react';
import { TrustCloudSession, type TrustCloudSessionProps } from './TrustCloudSession';
/** VideoID Unassisted — self-service document scan + liveness. */
export declare const VideoIdUnassistedSession: typeof TrustCloudSession;
/** VideoID Assisted — live agent call. Prefer openTrustCloudSession in-app-browser mode. */
export declare const VideoIdAssistedSession: typeof TrustCloudSession;
/** Sign — no camera/mic needed, so media permissions default off. */
export declare function SignSession(props: TrustCloudSessionProps): React.JSX.Element;
//# sourceMappingURL=aliases.d.ts.map