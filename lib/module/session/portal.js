"use strict";

let presenter = null;
let activeRequest = null;

/** Called by IdviaPortal on mount; returns an unregister function. */
export function registerPortal(fn) {
  presenter = fn;
  return () => {
    if (presenter !== fn) return; // a newer portal already took over
    presenter = null;
    // The portal unmounted mid-session (e.g. the host component tore down):
    // there's no one left to render the WebView, so settle the caller's
    // promise instead of leaving it hanging forever.
    if (activeRequest) {
      const request = activeRequest;
      activeRequest = null;
      request.onDone({
        outcome: 'cancel'
      });
    }
  };
}
export function presentInPortal(request) {
  if (!presenter) return false;
  const previous = activeRequest;
  const wrapped = {
    ...request,
    onDone: result => {
      if (activeRequest === wrapped) activeRequest = null;
      request.onDone(result);
    },
    onError: error => {
      if (activeRequest === wrapped) activeRequest = null;
      request.onError(error);
    }
  };
  activeRequest = wrapped;
  presenter(wrapped);
  // The superseded session's modal is torn down — resolve it as a cancel.
  previous?.onDone({
    outcome: 'cancel'
  });
  return true;
}
//# sourceMappingURL=portal.js.map