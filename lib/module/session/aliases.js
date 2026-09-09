"use strict";

import * as React from 'react';
import { TrustCloudSession } from './TrustCloudSession';

/** VideoID Unassisted — self-service document scan + liveness. */
import { jsx as _jsx } from "react/jsx-runtime";
export const VideoIdUnassistedSession = TrustCloudSession;

/** VideoID Assisted — live agent call. Prefer openTrustCloudSession in-app-browser mode. */
export const VideoIdAssistedSession = TrustCloudSession;

/** Sign — no camera/mic needed, so media permissions default off. */
export function SignSession(props) {
  return /*#__PURE__*/_jsx(TrustCloudSession, {
    mediaPermissions: false,
    ...props
  });
}
//# sourceMappingURL=aliases.js.map