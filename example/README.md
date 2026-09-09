# Example app

Expo dev-client app exercising the three SDK flows (VideoID Unassisted,
VideoID Assisted, Sign) end to end against the real TrustCloud APIs.

## Setup

```bash
cd example
npm install
cp config.example.ts config.ts   # then edit config.ts with your real credentials
```

`config.ts` is git-ignored — real credentials never leave your machine. Fill
in the client id/secret, use case ids, `docType`, `serviceCountry`/`language`
(assisted), the signer, and a reachable PDF URL for the Sign flow.

## Run (real device required for the video flows)

```bash
npx expo run:android    # or: npx expo run:ios
```

The camera does not work in emulators/simulators; Sign works anywhere.

## Debugging the WebView

Set `EXPO_PUBLIC_WEBVIEW_DEBUG=1` when starting Metro to turn on the
embedded-WebView instrumentation for the assisted flow:

```bash
EXPO_PUBLIC_WEBVIEW_DEBUG=1 npx expo start
```

With the flag set:

- the page's `console.*` output, JS errors, and unhandled promise rejections
  are forwarded to the Metro terminal (prefixed `[webview]`);
- network activity (fetch/XHR/WebSocket/RTCPeerConnection), getUserMedia
  calls, media-element playback, and AudioContext state are logged;
- every WebView navigation is logged (prefixed `[webview nav]`);
- remote debugging is enabled, so with the phone plugged in you can attach
  desktop Chrome DevTools via `chrome://inspect#devices`.

The variable is inlined at bundle time — restart Metro (not just a JS
reload) after changing it. Without the flag the example injects nothing and
the SDK's built-in behavior applies.
