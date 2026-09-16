"use strict";

import { makeError } from '../shared/types';
import { isValidHttpsUrl, matchLanding, parseQueryParams } from './matchLanding';
import { presentInPortal } from './portal';
export function resultFromRedirect(redirectUrl, landingUrl, landingKoUrl) {
  const outcome = landingKoUrl && matchLanding(redirectUrl, landingKoUrl) ? 'failure' : 'success';
  return {
    outcome,
    landingUrl: redirectUrl,
    params: parseQueryParams(redirectUrl)
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
  if (!isValidHttpsUrl(url)) {
    throw makeError('INVALID_URL', `url must be a valid HTTPS URL, got: ${String(url)}`);
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
  throw makeError('BROWSER_UNSUPPORTED', "in-app-browser mode requires 'expo-web-browser' or 'react-native-inappbrowser-reborn' to be installed");
}
export function openIdviaSession(options) {
  if ((options.mode ?? 'webview') === 'in-app-browser') {
    return openInAppBrowser(options);
  }
  return new Promise((resolve, reject) => {
    const presented = presentInPortal({
      url: options.url,
      landingUrl: options.landingUrl,
      landingKoUrl: options.landingKoUrl,
      onDone: resolve,
      onError: reject
    });
    if (!presented) {
      reject(makeError('PORTAL_NOT_MOUNTED', "Render <IdviaPortal /> once at your app root to use openIdviaSession with mode 'webview'"));
    }
  });
}
//# sourceMappingURL=openIdviaSession.js.map