"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.goBackCalls = exports.MockWebView = void 0;
exports.lastWebViewProps = lastWebViewProps;
exports.resetWebViewCapture = resetWebViewCapture;
exports.webViewMockModule = void 0;
var React = _interopRequireWildcard(require("react"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const captured = [];
const goBackCalls = exports.goBackCalls = [];
function lastWebViewProps() {
  const last = captured[captured.length - 1];
  if (!last) throw new Error('MockWebView was never rendered');
  return last.props;
}
function resetWebViewCapture() {
  captured.length = 0;
  goBackCalls.length = 0;
}
const MockWebView = exports.MockWebView = /*#__PURE__*/React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    goBack: () => goBackCalls.push(props.source?.uri)
  }));
  captured.push({
    props
  });
  return null;
});
const webViewMockModule = exports.webViewMockModule = {
  WebView: MockWebView,
  default: MockWebView
};
//# sourceMappingURL=webviewDouble.js.map