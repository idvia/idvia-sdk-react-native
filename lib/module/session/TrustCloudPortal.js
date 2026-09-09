"use strict";

import * as React from 'react';
import { Modal, View } from 'react-native';
import { TrustCloudSession } from './TrustCloudSession';
import { registerPortal } from './portal';

/**
 * Host for openTrustCloudSession's default 'webview' mode.
 * Render exactly once, at your app root.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export function TrustCloudPortal() {
  const [request, setRequest] = React.useState(null);
  React.useEffect(() => registerPortal(setRequest), []);
  if (!request) return null;
  const close = deliver => {
    setRequest(null);
    deliver();
  };
  return /*#__PURE__*/_jsx(Modal, {
    visible: true,
    animationType: "slide",
    onRequestClose: () => close(() => request.onDone({
      outcome: 'cancel'
    })),
    children: /*#__PURE__*/_jsx(View, {
      style: {
        flex: 1
      },
      children: /*#__PURE__*/_jsx(TrustCloudSession, {
        url: request.url,
        landingUrl: request.landingUrl,
        landingKoUrl: request.landingKoUrl,
        onSuccess: result => close(() => request.onDone(result)),
        onFailure: result => close(() => request.onDone(result)),
        onCancel: () => close(() => request.onDone({
          outcome: 'cancel'
        })),
        onError: error => close(() => request.onError(error)),
        style: {
          flex: 1
        }
      }, request.url)
    })
  });
}
//# sourceMappingURL=TrustCloudPortal.js.map