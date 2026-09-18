"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_ALLOWED_HOSTS = void 0;
exports.IdviaSession = IdviaSession;
var _react = _interopRequireWildcard(require("react"));
var React = _react;
var _reactNative = require("react-native");
var _types = require("../shared/types");
var _matchLanding = require("./matchLanding");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Optional at runtime: a missing peer dep is reported as WEBVIEW_UNSUPPORTED
// (Task 8), never a crash. The try/catch also makes Metro treat this require
// as an optional dependency.
let WebViewComponent = null;
let webViewLoadError = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- optional peer dep
  const mod = require('react-native-webview');
  WebViewComponent = mod.WebView ?? mod.default;
} catch (e) {
  webViewLoadError = e;
}

// The system WebView's navigator.permissions store is broken for
// 'camera'/'microphone': queries reject on some versions, and on others they
// report 'prompt' forever — getUserMedia grants are decided by the host app
// (this component's auto-grant), so the store never transitions to 'granted'
// and pages that wait for that transition hang. Inside this WebView,
// reporting 'granted' outright is the truthful answer.
const PERMISSIONS_QUERY_SHIM = `
(function () {
  try {
    if (!navigator.permissions) return;
    var originalQuery = navigator.permissions.query
      ? navigator.permissions.query.bind(navigator.permissions)
      : null;
    navigator.permissions.query = function (descriptor) {
      var name = descriptor && descriptor.name;
      if (name === 'camera' || name === 'microphone') {
        // Must look like a real PermissionStatus: consumers (e.g. the OpenTok
        // SDK) call addEventListener on it and crash on a plain object.
        return Promise.resolve({
          state: 'granted',
          name: name,
          onchange: null,
          addEventListener: function () {},
          removeEventListener: function () {},
          dispatchEvent: function () { return false; }
        });
      }
      if (originalQuery) return originalQuery(descriptor);
      return Promise.reject(new TypeError('permissions.query is not supported'));
    };
  } catch (e) {}
})();
true;
`;

/**
 * Hosts the embedded flow is allowed to navigate to in the main frame, besides the
 * hosts of `url`, `landingUrl` and `landingKoUrl`. Anything else is opened in the
 * system browser instead of inside the WebView, so a page reached through a link or
 * an open redirect never runs with the camera/microphone grants this component gives.
 */
const DEFAULT_ALLOWED_HOSTS = exports.DEFAULT_ALLOWED_HOSTS = ['*.trustcloud.solutions', '*.trustcloud.com', '*.idvia.com'];
function IdviaSession(props) {
  const {
    url,
    landingUrl,
    landingKoUrl,
    onNavigationEvent,
    renderLoading,
    mediaPermissions = true,
    allowedHosts,
    loadTimeoutMs = 30000,
    style,
    webViewProps
  } = props;
  const allowedHostPatterns = (0, _react.useMemo)(() => {
    const own = [url, landingUrl, landingKoUrl].map(u => u ? (0, _matchLanding.hostOf)(u) : null).filter(h => !!h);
    return [...own, ...DEFAULT_ALLOWED_HOSTS, ...(allowedHosts ?? [])];
  }, [url, landingUrl, landingKoUrl, allowedHosts]);
  const webViewRef = (0, _react.useRef)(null);
  const doneRef = (0, _react.useRef)(false);
  const canGoBackRef = (0, _react.useRef)(false);
  const loadedRef = (0, _react.useRef)(false);
  const currentUrlRef = (0, _react.useRef)(url);

  // Always-current callbacks so effects and long-lived closures never go stale.
  const callbacksRef = (0, _react.useRef)(props);
  callbacksRef.current = props;
  const configError = (0, _react.useMemo)(() => {
    if (webViewLoadError || !WebViewComponent) {
      return (0, _types.makeError)('WEBVIEW_UNSUPPORTED', 'react-native-webview is not installed. Run: npm install react-native-webview (then pod install on iOS) and rebuild the app.', webViewLoadError);
    }
    if (!(0, _matchLanding.isValidHttpsUrl)(url)) {
      return (0, _types.makeError)('INVALID_URL', `url must be a valid HTTPS URL, got: ${String(url)}`);
    }
    if (!(0, _matchLanding.isValidHttpsUrl)(landingUrl)) {
      return (0, _types.makeError)('INVALID_URL', `landingUrl must be a valid HTTPS URL, got: ${String(landingUrl)}`);
    }
    if (landingKoUrl !== undefined && !(0, _matchLanding.isValidHttpsUrl)(landingKoUrl)) {
      return (0, _types.makeError)('INVALID_URL', `landingKoUrl must be a valid HTTPS URL, got: ${String(landingKoUrl)}`);
    }
    return null;
  }, [url, landingUrl, landingKoUrl]);
  (0, _react.useEffect)(() => {
    if (configError) callbacksRef.current.onError?.(configError);
  }, [configError]);

  // Re-arm per-session state whenever the url changes, so a reused component
  // instance (e.g. a new session presented in the same portal) starts fresh
  // instead of inheriting a completed/loaded/navigable state from the prior url.
  (0, _react.useEffect)(() => {
    doneRef.current = false;
    loadedRef.current = false;
    canGoBackRef.current = false;
  }, [url]);
  (0, _react.useEffect)(() => {
    if (configError) return;
    const timer = setTimeout(() => {
      if (!loadedRef.current && !doneRef.current) {
        callbacksRef.current.onError?.((0, _types.makeError)('TIMEOUT', `The flow did not finish loading within ${loadTimeoutMs}ms`));
      }
    }, loadTimeoutMs);
    return () => clearTimeout(timer);
  }, [configError, loadTimeoutMs, url]);
  (0, _react.useEffect)(() => {
    if (_reactNative.Platform.OS !== 'android' || configError) return;
    const subscription = _reactNative.BackHandler.addEventListener('hardwareBackPress', () => {
      if (doneRef.current) return false;
      if (canGoBackRef.current && webViewRef.current?.goBack) {
        webViewRef.current.goBack();
      } else {
        callbacksRef.current.onCancel?.();
      }
      return true;
    });
    return () => subscription.remove();
  }, [configError]);
  const finish = (outcome, interceptedUrl) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const result = {
      outcome,
      landingUrl: interceptedUrl,
      params: (0, _matchLanding.parseQueryParams)(interceptedUrl)
    };
    if (outcome === 'success') callbacksRef.current.onSuccess?.(result);else callbacksRef.current.onFailure?.(result);
  };
  const handleShouldStartLoad = request => {
    if (doneRef.current) return false;
    // KO first: one landing URL may be a path-prefix of the other.
    if (landingKoUrl && (0, _matchLanding.matchLanding)(request.url, landingKoUrl)) {
      finish('failure', request.url);
      return false;
    }
    if ((0, _matchLanding.matchLanding)(request.url, landingUrl)) {
      finish('success', request.url);
      return false;
    }
    // Only the main frame is fenced: iframes (video providers, captchas) stay untouched.
    if (request.isTopFrame === false) return true;
    const host = (0, _matchLanding.hostOf)(request.url);
    if (host && !(0, _matchLanding.isHostAllowed)(host, allowedHostPatterns)) {
      // Not part of the flow: let the system browser have it, without the camera/mic
      // grants and cookies this WebView carries.
      _reactNative.Linking.openURL(request.url).catch(() => {});
      return false;
    }
    return true;
  };

  // The caller's handler runs first and can veto; the SDK's landing/host checks always run.
  const callerShouldStartLoad = webViewProps?.onShouldStartLoadWithRequest;
  const composedShouldStartLoad = callerShouldStartLoad ? request => callerShouldStartLoad(request) === false ? false : handleShouldStartLoad(request) : handleShouldStartLoad;
  const callerInjection = webViewProps?.injectedJavaScriptBeforeContentLoaded;
  const composedInjection = typeof callerInjection === 'string' && callerInjection.length > 0 ? `${PERMISSIONS_QUERY_SHIM}\n${callerInjection}` : PERMISSIONS_QUERY_SHIM;

  // Note: react-native-webview has no per-origin camera/mic hook on Android — the native
  // client grants whenever the app holds the permission. The host allowlist above is the
  // Android-side control; the grant type below only applies on iOS.
  const androidProps = _reactNative.Platform.OS === 'android' ? {
    thirdPartyCookiesEnabled: true
  } : {};
  if (configError) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: style
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: style,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(WebViewComponent, {
      ref: webViewRef,
      source: {
        uri: url
      },
      domStorageEnabled: true,
      sharedCookiesEnabled: true,
      allowsInlineMediaPlayback: true,
      mediaPlaybackRequiresUserAction: false,
      startInLoadingState: !!renderLoading,
      renderLoading: renderLoading,
      onNavigationStateChange: navState => {
        canGoBackRef.current = !!navState.canGoBack;
        currentUrlRef.current = navState.url;
        onNavigationEvent?.({
          url: navState.url,
          loading: !!navState.loading,
          canGoBack: !!navState.canGoBack
        });
      },
      onLoadEnd: () => {
        loadedRef.current = true;
      },
      onError: e => {
        if (doneRef.current) return;
        callbacksRef.current.onError?.((0, _types.makeError)('LOAD_FAILED', e?.nativeEvent?.description ?? 'WebView load failed', e?.nativeEvent));
      },
      onHttpError: e => {
        const nativeEvent = e?.nativeEvent;
        const isMainDocument = nativeEvent?.url === url || nativeEvent?.url === currentUrlRef.current;
        if (doneRef.current || !isMainDocument) return; // main document only
        callbacksRef.current.onError?.((0, _types.makeError)('LOAD_FAILED', `HTTP ${nativeEvent.statusCode} loading the flow`, nativeEvent));
      },
      ...androidProps,
      ...webViewProps,
      // Security props come last on purpose: webViewProps cannot loosen them.
      javaScriptEnabled: true,
      originWhitelist: ['https://*'],
      mixedContentMode: "never",
      mediaCapturePermissionGrantType: mediaPermissions ? 'grantIfSameHostElsePrompt' : 'deny',
      onShouldStartLoadWithRequest: composedShouldStartLoad,
      injectedJavaScriptBeforeContentLoaded: composedInjection,
      style: {
        flex: 1
      }
    })
  });
}
//# sourceMappingURL=IdviaSession.js.map