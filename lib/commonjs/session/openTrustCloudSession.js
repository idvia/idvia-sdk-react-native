"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTrustCloudSession = openTrustCloudSession;
exports.resultFromRedirect = resultFromRedirect;
var _types = require("../shared/types");
var _matchLanding = require("./matchLanding");
var _portal = require("./portal");
function resultFromRedirect(redirectUrl, landingUrl, landingKoUrl) {
  const outcome = landingKoUrl && (0, _matchLanding.matchLanding)(redirectUrl, landingKoUrl) ? 'failure' : 'success';
  return {
    outcome,
    landingUrl: redirectUrl,
    params: (0, _matchLanding.parseQueryParams)(redirectUrl)
  };
}
async function openInAppBrowser(options) {
  const {
    url,
    landingUrl,
    landingKoUrl
  } = options;

  // landingUrl is NOT validated here: deep-link schemes (myapp://...) are a
  // legitimate redirect target for the in-app browser to intercept.
  if (!(0, _matchLanding.isValidHttpsUrl)(url)) {
    throw (0, _types.makeError)('INVALID_URL', `url must be a valid HTTPS URL, got: ${String(url)}`);
  }

  // Both requires sit in try/catch so Metro treats them as optional deps.
  let expoWebBrowser = null;
  try {
    expoWebBrowser = require('expo-web-browser');
  } catch {
    // not installed
  }
  if (expoWebBrowser?.openAuthSessionAsync) {
    const res = await expoWebBrowser.openAuthSessionAsync(url, landingUrl);
    if (res?.type === 'success' && res.url) {
      return resultFromRedirect(res.url, landingUrl, landingKoUrl);
    }
    return {
      outcome: 'cancel'
    };
  }
  let inAppBrowserModule = null;
  try {
    inAppBrowserModule = require('react-native-inappbrowser-reborn');
  } catch {
    // not installed
  }
  const inAppBrowser = inAppBrowserModule?.InAppBrowser ?? inAppBrowserModule?.default;
  if (inAppBrowser?.openAuth) {
    const res = await inAppBrowser.openAuth(url, landingUrl, {
      ephemeralWebSession: false,
      showTitle: false,
      enableUrlBarHiding: true
    });
    if (res?.type === 'success' && res.url) {
      return resultFromRedirect(res.url, landingUrl, landingKoUrl);
    }
    return {
      outcome: 'cancel'
    };
  }
  throw (0, _types.makeError)('BROWSER_UNSUPPORTED', "in-app-browser mode requires 'expo-web-browser' or 'react-native-inappbrowser-reborn' to be installed");
}
function openTrustCloudSession(options) {
  if ((options.mode ?? 'webview') === 'in-app-browser') {
    return openInAppBrowser(options);
  }
  return new Promise((resolve, reject) => {
    const presented = (0, _portal.presentInPortal)({
      url: options.url,
      landingUrl: options.landingUrl,
      landingKoUrl: options.landingKoUrl,
      onDone: resolve,
      onError: reject
    });
    if (!presented) {
      reject((0, _types.makeError)('PORTAL_NOT_MOUNTED', "Render <TrustCloudPortal /> once at your app root to use openTrustCloudSession with mode 'webview'"));
    }
  });
}
//# sourceMappingURL=openTrustCloudSession.js.map