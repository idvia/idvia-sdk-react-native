"use strict";

import * as React from 'react';
import { IdviaSession } from './IdviaSession';

/** VideoID Unassisted — self-service document scan + liveness. */
import { jsx as _jsx } from "react/jsx-runtime";
export const VideoIdUnassistedSession = IdviaSession;

/** VideoID Assisted — live agent call. Prefer openIdviaSession in-app-browser mode. */
export const VideoIdAssistedSession = IdviaSession;

/** Sign — no camera/mic needed, so media permissions default off. */
export function SignSession(props) {
  return /*#__PURE__*/_jsx(IdviaSession, {
    mediaPermissions: false,
    ...props
  });
}
//# sourceMappingURL=aliases.js.map