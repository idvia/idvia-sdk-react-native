"use strict";

import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { makeError } from '../shared/types';
import { isValidHttpsUrl, matchLanding, parseQueryParams } from './matchLanding';

// Optional at runtime: a missing peer dep is reported as WEBVIEW_UNSUPPORTED
// (Task 8), never a crash. The try/catch also makes Metro treat this require
// as an optional dependency.
import { jsx as _jsx } from "react/jsx-runtime";
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
export function IdviaSession(props) {
  const {
    url,
    landingUrl,
    landingKoUrl,
    onNavigationEvent,
    renderLoading,
    mediaPermissions = true,
    loadTimeoutMs = 30000,
    style,
    webViewProps
  } = props;
  const webViewRef = useRef(null);
  const doneRef = useRef(false);
  const canGoBackRef = useRef(false);
  const loadedRef = useRef(false);
  const currentUrlRef = useRef(url);

  // Always-current callbacks so effects and long-lived closures never go stale.
  const callbacksRef = useRef(props);
  callbacksRef.current = props;
  const configError = useMemo(() => {
    if (webViewLoadError || !WebViewComponent) {
      return makeError('WEBVIEW_UNSUPPORTED', 'react-native-webview is not installed. Run: npm install react-native-webview (then pod install on iOS) and rebuild the app.', webViewLoadError);
    }
    if (!isValidHttpsUrl(url)) {
      return makeError('INVALID_URL', `url must be a valid HTTPS URL, got: ${String(url)}`);
    }
    if (!isValidHttpsUrl(landingUrl)) {
      return makeError('INVALID_URL', `landingUrl must be a valid HTTPS URL, got: ${String(landingUrl)}`);
    }
    if (landingKoUrl !== undefined && !isValidHttpsUrl(landingKoUrl)) {
      return makeError('INVALID_URL', `landingKoUrl must be a valid HTTPS URL, got: ${String(landingKoUrl)}`);
    }
    return null;
  }, [url, landingUrl, landingKoUrl]);
  useEffect(() => {
    if (configError) callbacksRef.current.onError?.(configError);
  }, [configError]);

  // Re-arm per-session state whenever the url changes, so a reused component
  // instance (e.g. a new session presented in the same portal) starts fresh
  // instead of inheriting a completed/loaded/navigable state from the prior url.
  useEffect(() => {
    doneRef.current = false;
    loadedRef.current = false;
    canGoBackRef.current = false;
  }, [url]);
  useEffect(() => {
    if (configError) return;
    const timer = setTimeout(() => {
      if (!loadedRef.current && !doneRef.current) {
        callbacksRef.current.onError?.(makeError('TIMEOUT', `The flow did not finish loading within ${loadTimeoutMs}ms`));
      }
    }, loadTimeoutMs);
    return () => clearTimeout(timer);
  }, [configError, loadTimeoutMs, url]);
  useEffect(() => {
    if (Platform.OS !== 'android' || configError) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
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
      params: parseQueryParams(interceptedUrl)
    };
    if (outcome === 'success') callbacksRef.current.onSuccess?.(result);else callbacksRef.current.onFailure?.(result);
  };
  const handleShouldStartLoad = request => {
    if (doneRef.current) return false;
    // KO first: one landing URL may be a path-prefix of the other.
    if (landingKoUrl && matchLanding(request.url, landingKoUrl)) {
      finish('failure', request.url);
      return false;
    }
    if (matchLanding(request.url, landingUrl)) {
      finish('success', request.url);
      return false;
    }
    return true;
  };
  const androidProps = Platform.OS === 'android' ? {
    thirdPartyCookiesEnabled: true,
    onPermissionRequest: event => {
      if (mediaPermissions) {
        event?.grant?.(event?.resources ?? []);
      } else {
        event?.deny?.();
        callbacksRef.current.onError?.(makeError('PERMISSION_DENIED', 'The page requested camera/microphone but mediaPermissions is false'));
      }
    }
  } : {};
  if (configError) {
    return /*#__PURE__*/_jsx(View, {
      style: style
    });
  }
  return /*#__PURE__*/_jsx(View, {
    style: style,
    children: /*#__PURE__*/_jsx(WebViewComponent, {
      ref: webViewRef,
      source: {
        uri: url
      },
      javaScriptEnabled: true,
      domStorageEnabled: true,
      sharedCookiesEnabled: true,
      allowsInlineMediaPlayback: true,
      mediaPlaybackRequiresUserAction: false,
      mediaCapturePermissionGrantType: "grant",
      mixedContentMode: "never",
      originWhitelist: ['https://*'],
      injectedJavaScriptBeforeContentLoaded: PERMISSIONS_QUERY_SHIM,
      startInLoadingState: !!renderLoading,
      renderLoading: renderLoading,
      onShouldStartLoadWithRequest: handleShouldStartLoad,
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
        callbacksRef.current.onError?.(makeError('LOAD_FAILED', e?.nativeEvent?.description ?? 'WebView load failed', e?.nativeEvent));
      },
      onHttpError: e => {
        const nativeEvent = e?.nativeEvent;
        const isMainDocument = nativeEvent?.url === url || nativeEvent?.url === currentUrlRef.current;
        if (doneRef.current || !isMainDocument) return; // main document only
        callbacksRef.current.onError?.(makeError('LOAD_FAILED', `HTTP ${nativeEvent.statusCode} loading the flow`, nativeEvent));
      },
      ...androidProps,
      ...webViewProps,
      style: {
        flex: 1
      }
    })
  });
}
//# sourceMappingURL=IdviaSession.js.map