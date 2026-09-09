"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrustCloudPortal = TrustCloudPortal;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _TrustCloudSession = require("./TrustCloudSession");
var _portal = require("./portal");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Host for openTrustCloudSession's default 'webview' mode.
 * Render exactly once, at your app root.
 */
function TrustCloudPortal() {
  const [request, setRequest] = React.useState(null);
  React.useEffect(() => (0, _portal.registerPortal)(setRequest), []);
  if (!request) return null;
  const close = deliver => {
    setRequest(null);
    deliver();
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Modal, {
    visible: true,
    animationType: "slide",
    onRequestClose: () => close(() => request.onDone({
      outcome: 'cancel'
    })),
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: {
        flex: 1
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_TrustCloudSession.TrustCloudSession, {
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