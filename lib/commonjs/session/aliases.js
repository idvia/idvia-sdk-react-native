"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignSession = SignSession;
exports.VideoIdUnassistedSession = exports.VideoIdAssistedSession = void 0;
var React = _interopRequireWildcard(require("react"));
var _IdviaSession = require("./IdviaSession");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/** VideoID Unassisted — self-service document scan + liveness. */
const VideoIdUnassistedSession = exports.VideoIdUnassistedSession = _IdviaSession.IdviaSession;

/** VideoID Assisted — live agent call. Prefer openIdviaSession in-app-browser mode. */
const VideoIdAssistedSession = exports.VideoIdAssistedSession = _IdviaSession.IdviaSession;

/** Sign — no camera/mic needed, so media permissions default off. */
function SignSession(props) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_IdviaSession.IdviaSession, {
    mediaPermissions: false,
    ...props
  });
}
//# sourceMappingURL=aliases.js.map