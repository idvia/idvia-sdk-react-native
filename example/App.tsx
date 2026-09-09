import * as React from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  SignSession,
  TrustCloudClient,
  TrustCloudPortal,
  TrustCloudSession,
  openTrustCloudSession,
  type TrustCloudResult,
} from '@trustcloud/react-native-sdk';
import { CONFIG } from './config';
import { ensureMediaPermissions } from './permissions';

const client = new TrustCloudClient(CONFIG);

// Set EXPO_PUBLIC_WEBVIEW_DEBUG=1 (e.g. `EXPO_PUBLIC_WEBVIEW_DEBUG=1 npx expo start`)
// to forward the webview page's console, errors, network and media activity to
// Metro, and to enable chrome://inspect remote debugging of the webview.
const WEBVIEW_DEBUG = process.env.EXPO_PUBLIC_WEBVIEW_DEBUG === '1';

type Flow = 'unassisted' | 'assisted' | 'sign';
type Screen =
  | { name: 'home' }
  | { name: 'session'; flow: Flow; url: string; ids?: Record<string, string> }
  | { name: 'result'; flow: Flow; text: string; ids?: Record<string, string> };

export default function App() {
  const [screen, setScreen] = React.useState<Screen>({ name: 'home' });
  const [assistedInBrowser, setAssistedInBrowser] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const fail = (e: unknown) => {
    // Error#message is non-enumerable, so surface it explicitly
    const detail =
      e instanceof Error
        ? `${e.message}\n${JSON.stringify(e, null, 2)}`
        : JSON.stringify(e, null, 2);
    setScreen({ name: 'result', flow: 'unassisted', text: `Error: ${detail}` });
  };

  async function startUnassisted() {
    setBusy(true);
    try {
      if (!(await ensureMediaPermissions())) return fail('camera/mic permission denied');
      const s = await client.createVideoIdUnassisted({
        clientReference: `example-${Math.random().toString(36).slice(2)}`,
        docType: CONFIG.docType,
        docNumber: '',
        documentCountry: CONFIG.serviceCountry,
        serviceCountry: CONFIG.serviceCountry,
        metadata: '',
        name: '',
        surname: '',
        birthday: '',
        email: '',
        landingUrl: CONFIG.landingUrl,
        landingKoUrl: CONFIG.landingKoUrl,
        configuration: CONFIG.unassistedConfiguration,
      });
      setScreen({
        name: 'session',
        flow: 'unassisted',
        url: s.url,
        ids: { trustCloudFileId: s.trustCloudFileId, videoIdentificationId: s.videoIdentificationId },
      });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function startAssisted() {
    setBusy(true);
    try {
      if (!(await ensureMediaPermissions())) return fail('camera/mic permission denied');
      const s = await client.createVideoIdAssisted({
        clientReference: `example-${Math.random().toString(36).slice(2)}`,
        serviceCountry: CONFIG.serviceCountry,
        language: CONFIG.language,
        name: CONFIG.subject.name,
        surname: CONFIG.subject.surname,
        landingUrl: CONFIG.landingUrl,
      });
      // plain-text assisted responses carry no ids — status polling is unavailable then
      const ids = s.trustCloudFileId ? { trustCloudFileId: s.trustCloudFileId } : undefined;
      if (assistedInBrowser) {
        const result = await openTrustCloudSession({
          url: s.url,
          landingUrl: CONFIG.landingUrl,
          mode: 'in-app-browser',
        });
        onSessionDone('assisted', result, ids);
      } else {
        setScreen({ name: 'session', flow: 'assisted', url: s.url, ids });
      }
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function startSign() {
    setBusy(true);
    try {
      const s = await client.createSignSession({
        signers: [CONFIG.signer],
        documents: [{ url: CONFIG.signDocumentUrl }],
      });
      setScreen({ name: 'session', flow: 'sign', url: s.url, ids: { trustCloudFileId: s.trustCloudFileId } });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  function onSessionDone(flow: Flow, result: TrustCloudResult, ids?: Record<string, string>) {
    setScreen({
      name: 'result',
      flow,
      ids,
      text: `Client outcome (UX signal only): ${result.outcome}\nparams: ${JSON.stringify(result.params)}`,
    });
  }

  async function fetchStatus(flow: Flow, ids: Record<string, string>) {
    try {
      const status =
        flow === 'unassisted'
          ? await client.getVideoIdUnassistedStatus({
              trustCloudFileId: ids.trustCloudFileId,
              videoIdentificationId: ids.videoIdentificationId,
            })
          : flow === 'assisted'
            ? await client.getVideoIdAssistedStatus({ trustCloudFileId: ids.trustCloudFileId })
            : await client.getSignStatus({ trustCloudFileId: ids.trustCloudFileId });
      setScreen({
        name: 'result',
        flow,
        ids,
        text: `Authoritative status:\n${JSON.stringify(status, null, 2)}`,
      });
    } catch (e) {
      fail(e);
    }
  }

  if (screen.name === 'session') {
    const Session = screen.flow === 'sign' ? SignSession : TrustCloudSession;
    // The Android System WebView UA carries a "; wv)" token that WebRTC
    // providers (OpenTok/Vonage) sniff as an unsupported browser, breaking
    // the assisted flow's mic detection. Present a Chrome-like UA instead.
    // DEBUG: forwards the page's console/errors to Metro. Since a
    // caller-supplied injection replaces the SDK's, the permissions.query
    // shim is re-included here.
    const debugInjection = `
(function () {
  try {
    if (navigator.permissions) {
      var originalQuery = navigator.permissions.query
        ? navigator.permissions.query.bind(navigator.permissions)
        : null;
      navigator.permissions.query = function (descriptor) {
        var name = descriptor && descriptor.name;
        if (name === 'camera' || name === 'microphone') {
          // the WebView permission store never transitions to 'granted';
          // the SDK auto-grants getUserMedia, so report granted directly.
          // Must be PermissionStatus-shaped: OpenTok calls addEventListener.
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
    }
  } catch (e) {}
  function send(level, args) {
    try {
      var msg = Array.prototype.map.call(args, function (a) {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      }).join(' ');
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('[' + level + '] ' + msg);
    } catch (e) {}
  }
  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (level) {
    var orig = console[level];
    console[level] = function () { send(level, arguments); if (orig) orig.apply(console, arguments); };
  });
  window.addEventListener('error', function (e) {
    send('window.onerror', [e.message, e.filename, e.lineno]);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e && e.reason;
    send('unhandledrejection', [(reason && (reason.stack || reason.message)) || String(reason)]);
  });
  // network taps: fetch / XHR / WebSocket / RTCPeerConnection
  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (input) {
      var url = typeof input === 'string' ? input : (input && input.url);
      send('fetch', [url]);
      return origFetch.apply(this, arguments).then(
        function (res) { send('fetch:done', [res.status, url]); return res; },
        function (err) { send('fetch:fail', [url, String(err)]); throw err; }
      );
    };
  }
  var OrigXHR = window.XMLHttpRequest;
  if (OrigXHR) {
    var origOpen = OrigXHR.prototype.open;
    var origSendX = OrigXHR.prototype.send;
    OrigXHR.prototype.open = function (method, url) {
      this.__dbgUrl = method + ' ' + url;
      return origOpen.apply(this, arguments);
    };
    OrigXHR.prototype.send = function () {
      var self = this;
      send('xhr', [this.__dbgUrl]);
      this.addEventListener('loadend', function () { send('xhr:done', [self.status, self.__dbgUrl]); });
      return origSendX.apply(this, arguments);
    };
  }
  var OrigWS = window.WebSocket;
  if (OrigWS) {
    var WrappedWS = function (url, protocols) {
      send('ws:open', [url]);
      var ws = protocols !== undefined ? new OrigWS(url, protocols) : new OrigWS(url);
      ws.addEventListener('open', function () { send('ws:connected', [url]); });
      ws.addEventListener('error', function () { send('ws:error', [url]); });
      ws.addEventListener('close', function (e) { send('ws:closed', [e.code, url]); });
      return ws;
    };
    WrappedWS.prototype = OrigWS.prototype;
    WrappedWS.CONNECTING = OrigWS.CONNECTING;
    WrappedWS.OPEN = OrigWS.OPEN;
    WrappedWS.CLOSING = OrigWS.CLOSING;
    WrappedWS.CLOSED = OrigWS.CLOSED;
    window.WebSocket = WrappedWS;
  }
  var OrigPC = window.RTCPeerConnection;
  if (OrigPC) {
    var WrappedPC = function (cfg) {
      send('pc:new', ['iceServers=' + (cfg && cfg.iceServers ? cfg.iceServers.length : 0)]);
      var pc = new OrigPC(cfg);
      pc.addEventListener('iceconnectionstatechange', function () { send('pc:ice', [pc.iceConnectionState]); });
      pc.addEventListener('connectionstatechange', function () { send('pc:conn', [pc.connectionState]); });
      return pc;
    };
    WrappedPC.prototype = OrigPC.prototype;
    if (OrigPC.generateCertificate) WrappedPC.generateCertificate = OrigPC.generateCertificate.bind(OrigPC);
    window.RTCPeerConnection = WrappedPC;
  }
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    var origGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function (constraints) {
      send('gum', [JSON.stringify(constraints)]);
      return origGUM(constraints).then(
        function (stream) {
          send('gum:ok', [stream.getTracks().map(function (t) { return t.kind + ':' + t.readyState; }).join(',')]);
          return stream;
        },
        function (err) {
          send('gum:fail', [err.name + ' ' + err.message]);
          throw err;
        }
      );
    };
  }
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    var origED = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function () {
      return origED().then(function (devices) {
        send('enumDevices', [devices.map(function (d) { return d.kind + (d.label ? '(labeled)' : '(unlabeled)'); }).join(',')]);
        return devices;
      });
    };
  }
  var otTries = 0;
  var otPoll = setInterval(function () {
    otTries++;
    if (window.OT && window.OT.setLogLevel) {
      try { window.OT.setLogLevel(4); send('debug', ['OT verbose logging enabled']); } catch (e) {}
      clearInterval(otPoll);
    } else if (otTries > 20) {
      send('debug', ['window.OT not found (bundled import?)']);
      clearInterval(otPoll);
    }
  }, 250);
  var origPlay = window.HTMLMediaElement && HTMLMediaElement.prototype.play;
  if (origPlay) {
    HTMLMediaElement.prototype.play = function () {
      var el = this;
      send('media:play', [el.tagName + (el.muted ? ':muted' : '') + (el.srcObject ? ':stream' : ':src')]);
      var p = origPlay.apply(this, arguments);
      if (p && p.then) {
        p.then(
          function () { send('media:playing', [el.tagName]); },
          function (e) { send('media:playfail', [String(e && e.name) + ' ' + String(e && e.message)]); }
        );
      }
      return p;
    };
  }
  var OrigAC = window.AudioContext || window.webkitAudioContext;
  if (OrigAC) {
    var WrappedAC = function () {
      var ac = new OrigAC();
      send('audioctx:new', [ac.state]);
      ac.addEventListener('statechange', function () { send('audioctx:state', [ac.state]); });
      return ac;
    };
    WrappedAC.prototype = OrigAC.prototype;
    window.AudioContext = WrappedAC;
    if (window.webkitAudioContext) window.webkitAudioContext = WrappedAC;
  }
  var origCreate = document.createElement.bind(document);
  document.createElement = function (tag) {
    var el = origCreate.apply(document, arguments);
    if (String(tag).toLowerCase() === 'video') {
      send('video:created', []);
      ['loadedmetadata', 'playing', 'canplay', 'pause', 'error', 'stalled'].forEach(function (ev) {
        el.addEventListener(ev, function () { send('video:' + ev, [el.videoWidth + 'x' + el.videoHeight]); });
      });
    }
    return el;
  };
  send('features', [
    'getCapabilities=' + (typeof MediaStreamTrack !== 'undefined' && !!MediaStreamTrack.prototype.getCapabilities),
    'getSettings=' + (typeof MediaStreamTrack !== 'undefined' && !!MediaStreamTrack.prototype.getSettings),
    'RTCRtpSender=' + (typeof RTCRtpSender !== 'undefined'),
    'getStats=' + (typeof RTCPeerConnection !== 'undefined' && !!RTCPeerConnection.prototype.getStats),
    'AudioWorklet=' + (typeof AudioWorkletNode !== 'undefined'),
    'requestVideoFrameCallback=' + (typeof HTMLVideoElement !== 'undefined' && !!HTMLVideoElement.prototype.requestVideoFrameCallback),
    'ImageCapture=' + (typeof ImageCapture !== 'undefined'),
    'insertableStreams=' + (typeof RTCRtpSender !== 'undefined' && !!RTCRtpSender.prototype.createEncodedStreams),
  ].join(' '));
  send('debug', ['console capture active, UA=' + navigator.userAgent]);
})();
true;
`;
    const webViewProps =
      screen.flow === 'assisted'
        ? {
            userAgent:
              'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
            // Debug-only extras. Note: the injection replaces the SDK's own
            // permissions shim, which is why debugInjection re-includes it —
            // without the env var the SDK's built-in shim applies.
            ...(WEBVIEW_DEBUG
              ? {
                  injectedJavaScriptBeforeContentLoaded: debugInjection,
                  webviewDebuggingEnabled: true,
                  onMessage: (event: { nativeEvent: { data: string } }) =>
                    console.log('[webview]', event.nativeEvent.data),
                }
              : {}),
          }
        : undefined;
    return (
      <Session
        url={screen.url}
        landingUrl={CONFIG.landingUrl}
        landingKoUrl={CONFIG.landingKoUrl}
        webViewProps={webViewProps}
        onNavigationEvent={
          WEBVIEW_DEBUG
            ? (e) => console.log('[webview nav]', e.loading ? 'loading' : 'done', e.url)
            : undefined
        }
        onSuccess={(r) => onSessionDone(screen.flow, r, screen.ids)}
        onFailure={(r) => onSessionDone(screen.flow, r, screen.ids)}
        onCancel={() => setScreen({ name: 'home' })}
        onError={(e) => setScreen({ name: 'result', flow: screen.flow, text: `SDK error: ${e.code} — ${e.message}` })}
        renderLoading={() => <ActivityIndicator style={styles.center} size="large" />}
        style={styles.flex}
      />
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>TrustCloud SDK example</Text>
        {screen.name === 'result' ? (
          <>
            <Text style={styles.mono}>{screen.text}</Text>
            {screen.ids ? (
              <Button title="Fetch authoritative status" onPress={() => fetchStatus(screen.flow, screen.ids!)} />
            ) : null}
            <Button title="Back" onPress={() => setScreen({ name: 'home' })} />
          </>
        ) : busy ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Button title="VideoID Unassisted (embedded)" onPress={startUnassisted} />
            <View style={styles.row}>
              <Button title="VideoID Assisted" onPress={startAssisted} />
              <Text> in-app browser </Text>
              <Switch value={assistedInBrowser} onValueChange={setAssistedInBrowser} />
            </View>
            <Button title="Sign (embedded)" onPress={startSign} />
          </>
        )}
      </ScrollView>
      <TrustCloudPortal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignSelf: 'center' },
  container: { padding: 24, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  mono: { fontFamily: 'monospace', fontSize: 12 },
});
