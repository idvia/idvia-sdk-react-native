"use strict";

import * as React from 'react';
const captured = [];
export const goBackCalls = [];
export function lastWebViewProps() {
  const last = captured[captured.length - 1];
  if (!last) throw new Error('MockWebView was never rendered');
  return last.props;
}
export function resetWebViewCapture() {
  captured.length = 0;
  goBackCalls.length = 0;
}
export const MockWebView = /*#__PURE__*/React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    goBack: () => goBackCalls.push(props.source?.uri)
  }));
  captured.push({
    props
  });
  return null;
});
export const webViewMockModule = {
  WebView: MockWebView,
  default: MockWebView
};
//# sourceMappingURL=webviewDouble.js.map