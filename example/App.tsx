import * as React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SignSession,
  IdviaClient,
  IdviaPortal,
  IdviaSession,
  openIdviaSession,
  type IdviaResult,
} from '@idvia/react-native-sdk';
import { CONFIG } from './config';
import { ensureMediaPermissions } from './permissions';

const client = new IdviaClient(CONFIG);

// Set EXPO_PUBLIC_WEBVIEW_DEBUG=1 (e.g. `EXPO_PUBLIC_WEBVIEW_DEBUG=1 npx expo start`)
// to forward the webview page's console, errors, network and media activity to
// Metro, and to enable chrome://inspect remote debugging of the webview.
const WEBVIEW_DEBUG = process.env.EXPO_PUBLIC_WEBVIEW_DEBUG === '1';

type Flow = 'unassisted' | 'assisted' | 'sign';
type Verdict = 'success' | 'failure' | 'cancel' | 'error' | 'status';
type Screen =
  | { name: 'home' }
  | { name: 'session'; flow: Flow; url: string; ids?: Record<string, string> }
  | { name: 'result'; flow: Flow; verdict: Verdict; text: string; ids?: Record<string, string> };

const FLOWS: { flow: Flow; title: string; description: string }[] = [
  {
    flow: 'unassisted',
    title: 'VideoID Unassisted',
    description: 'Self-service document scan and liveness check.',
  },
  {
    flow: 'assisted',
    title: 'VideoID Assisted',
    description: 'Live video call with a verification agent.',
  },
  {
    flow: 'sign',
    title: 'Sign',
    description: 'Review and sign a document.',
  },
];

const FLOW_TITLE: Record<Flow, string> = Object.fromEntries(
  FLOWS.map((f) => [f.flow, f.title])
) as Record<Flow, string>;

const VERDICT_LABEL: Record<Verdict, string> = {
  success: 'Completed',
  failure: 'Failed',
  cancel: 'Cancelled',
  error: 'Error',
  status: 'Status',
};

export default function App() {
  const [screen, setScreen] = React.useState<Screen>({ name: 'home' });
  const [assistedInBrowser, setAssistedInBrowser] = React.useState(true);
  const [busy, setBusy] = React.useState<Flow | null>(null);

  const fail = (flow: Flow, e: unknown) => {
    // Error#message is non-enumerable, so surface it explicitly
    const detail =
      e instanceof Error
        ? `${e.message}\n${JSON.stringify(e, null, 2)}`
        : JSON.stringify(e, null, 2);
    setScreen({ name: 'result', flow, verdict: 'error', text: detail });
  };

  async function startUnassisted() {
    setBusy('unassisted');
    try {
      if (!(await ensureMediaPermissions())) return fail('unassisted', 'camera/mic permission denied');
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
      fail('unassisted', e);
    } finally {
      setBusy(null);
    }
  }

  async function startAssisted() {
    setBusy('assisted');
    try {
      if (!(await ensureMediaPermissions())) return fail('assisted', 'camera/mic permission denied');
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
        const result = await openIdviaSession({
          url: s.url,
          landingUrl: CONFIG.landingUrl,
          mode: 'in-app-browser',
        });
        onSessionDone('assisted', result, ids);
      } else {
        setScreen({ name: 'session', flow: 'assisted', url: s.url, ids });
      }
    } catch (e) {
      fail('assisted', e);
    } finally {
      setBusy(null);
    }
  }

  async function startSign() {
    setBusy('sign');
    try {
      const s = await client.createSignSession({
        signers: [CONFIG.signer],
        documents: [{ url: CONFIG.signDocumentUrl }],
      });
      setScreen({ name: 'session', flow: 'sign', url: s.url, ids: { trustCloudFileId: s.trustCloudFileId } });
    } catch (e) {
      fail('sign', e);
    } finally {
      setBusy(null);
    }
  }

  function onSessionDone(flow: Flow, result: IdviaResult, ids?: Record<string, string>) {
    setScreen({
      name: 'result',
      flow,
      ids,
      verdict: result.outcome,
      text: `params: ${JSON.stringify(result.params, null, 2)}`,
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
        verdict: 'status',
        text: JSON.stringify(status, null, 2),
      });
    } catch (e) {
      fail(flow, e);
    }
  }

  if (screen.name === 'session') {
    const Session = screen.flow === 'sign' ? SignSession : IdviaSession;
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
        onError={(e) =>
          setScreen({
            name: 'result',
            flow: screen.flow,
            verdict: 'error',
            text: `SDK error: ${e.code} — ${e.message}`,
          })
        }
        renderLoading={() => <ActivityIndicator style={styles.center} size="large" />}
        style={styles.flex}
      />
    );
  }

  const startFlow: Record<Flow, () => void> = {
    unassisted: startUnassisted,
    assisted: startAssisted,
    sign: startSign,
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Idvia</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerSub}>SDK example</Text>
            <View style={styles.envChip}>
              <Text style={styles.envChipText}>{CONFIG.environment}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <ScrollView style={styles.flex} contentContainerStyle={styles.bodyContent}>
        {screen.name === 'result' ? (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultFlow}>{FLOW_TITLE[screen.flow]}</Text>
              <Text style={[styles.verdict, { color: VERDICT_COLOR[screen.verdict] }]}>
                {VERDICT_LABEL[screen.verdict]}
              </Text>
            </View>
            {screen.verdict !== 'status' && screen.verdict !== 'error' ? (
              <Text style={styles.note}>
                The client outcome is a UX signal only — the authoritative result comes from the
                status endpoint.
              </Text>
            ) : null}
            {screen.ids ? (
              <View style={styles.idBlock}>
                {Object.entries(screen.ids).map(([key, value]) => (
                  <Text key={key} style={styles.idLine} selectable>
                    <Text style={styles.idKey}>{key}{'  '}</Text>
                    {value}
                  </Text>
                ))}
              </View>
            ) : null}
            <View style={styles.console}>
              <Text style={styles.consoleText} selectable>
                {screen.text}
              </Text>
            </View>
            {screen.ids ? (
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedDim]}
                onPress={() => fetchStatus(screen.flow, screen.ids!)}
              >
                <Text style={styles.primaryButtonText}>Fetch authoritative status</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.quietButton, pressed && styles.pressedDim]}
              onPress={() => setScreen({ name: 'home' })}
            >
              <Text style={styles.quietButtonText}>Back to flows</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.lede}>
              Run each flow against the {CONFIG.environment} environment with the credentials in
              config.ts.
            </Text>
            <View style={styles.ledger}>
              {FLOWS.map(({ flow, title, description }, index) => {
                const mode = flow === 'assisted' && assistedInBrowser ? 'browser' : 'embedded';
                return (
                  <View key={flow} style={index > 0 && styles.rowDivider}>
                    <Pressable
                      android_ripple={{ color: 'rgba(17, 28, 46, 0.08)' }}
                      style={({ pressed }) => [styles.flowRow, pressed && styles.rowPressed]}
                      disabled={busy !== null}
                      onPress={startFlow[flow]}
                    >
                      <View style={styles.flowText}>
                        <Text style={styles.flowTitle}>{title}</Text>
                        <Text style={styles.flowDescription}>{description}</Text>
                      </View>
                      <View style={styles.modeTag}>
                        <Text style={styles.modeTagText}>{mode}</Text>
                      </View>
                      {busy === flow ? (
                        <ActivityIndicator size="small" color={INK} />
                      ) : (
                        <Text style={styles.chevron}>›</Text>
                      )}
                    </Pressable>
                    {flow === 'assisted' ? (
                      <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Open in the in-app browser</Text>
                        <Switch
                          value={assistedInBrowser}
                          onValueChange={setAssistedInBrowser}
                          trackColor={{ true: VERIFIED }}
                          disabled={busy !== null}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      <IdviaPortal />
    </View>
  );
}

const INK = '#111C2E';
const PAPER = '#F7F8FA';
const SLATE = '#5B6675';
const HAIRLINE = '#E3E7ED';
const VERIFIED = '#0E7A5B';
const ALERT = '#B3261E';
const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

const VERDICT_COLOR: Record<Verdict, string> = {
  success: VERIFIED,
  failure: ALERT,
  cancel: SLATE,
  error: ALERT,
  status: INK,
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignSelf: 'center' },
  root: { flex: 1, backgroundColor: PAPER },

  headerSafe: {
    backgroundColor: INK,
    // Android draws edge-to-edge; RN's SafeAreaView only pads on iOS.
    paddingTop: Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 24) : 0,
  },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 22 },
  wordmark: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  headerSub: { color: '#9AA6B8', fontSize: 14 },
  envChip: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  envChipText: { color: '#E8ECF2', fontFamily: MONO, fontSize: 12 },

  bodyContent: { padding: 24, paddingBottom: 48, gap: 16 },
  lede: { fontSize: 14, color: SLATE, lineHeight: 20 },

  ledger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
    overflow: 'hidden',
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: HAIRLINE },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  rowPressed: { backgroundColor: '#F0F2F6' },
  flowText: { flex: 1, gap: 2 },
  flowTitle: { fontSize: 16, fontWeight: '600', color: INK },
  flowDescription: { fontSize: 13, color: SLATE, lineHeight: 18 },
  modeTag: {
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modeTagText: { fontSize: 11, color: SLATE, fontFamily: MONO },
  chevron: { fontSize: 22, color: '#9AA6B8', marginTop: -2 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 2,
  },
  optionLabel: { fontSize: 13, color: SLATE },

  resultHeader: { gap: 2 },
  resultFlow: { fontSize: 14, color: SLATE },
  verdict: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  note: { fontSize: 13, color: SLATE, lineHeight: 19 },
  idBlock: { gap: 4 },
  idLine: { fontFamily: MONO, fontSize: 12, color: INK },
  idKey: { color: SLATE },
  console: { backgroundColor: INK, borderRadius: 12, padding: 16 },
  consoleText: { fontFamily: MONO, fontSize: 12, lineHeight: 18, color: '#D9E1EC' },
  primaryButton: { backgroundColor: INK, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  quietButton: { paddingVertical: 12, alignItems: 'center' },
  quietButtonText: { color: SLATE, fontSize: 15, fontWeight: '500' },
  pressedDim: { opacity: 0.7 },
});
