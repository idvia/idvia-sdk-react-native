import * as React from 'react';
import { IdviaSession, type IdviaSessionProps } from './IdviaSession';
/** VideoID Unassisted — self-service document scan + liveness. */
export declare const VideoIdUnassistedSession: typeof IdviaSession;
/** VideoID Assisted — live agent call. Prefer openIdviaSession in-app-browser mode. */
export declare const VideoIdAssistedSession: typeof IdviaSession;
/** Sign — no camera/mic needed, so media permissions default off. */
export declare function SignSession(props: IdviaSessionProps): React.JSX.Element;
//# sourceMappingURL=aliases.d.ts.map