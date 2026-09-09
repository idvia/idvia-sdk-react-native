# Guide: VideoID Assisted

Live identity verification: the user joins a **real-time video call** with a
TrustCloud agent who checks their document and identity. The call is powered by
WebRTC (OpenTok / Vonage).

> **⚠️ Read [WebView vs in-app browser](#webview-vs-in-app-browser) first.**
> Assisted is the one flow where the embedded-WebView choice matters. A real-time
> video call is more sensitive to the host WebView than a self-service scan.

## Prerequisites

- Camera + microphone permissions configured — see [Platform setup](../platform-setup.md).
- A backend endpoint that creates an assisted session — see
  [Backend: creating a session](../backend-session-creation.md#videoid-assisted).

## WebView vs in-app browser

| Mode | Pros | Cons | Use when |
|------|------|------|----------|
| **Embedded WebView** (`<VideoIdAssistedSession>`) | Fully in-app UI; you control the chrome | WebRTC behaviour varies by OS/WebView version | You want an in-app feel and have tested on your target devices |
| **In-app browser** (`openTrustCloudSession({ mode: 'in-app-browser' })`) | Uses the system browser engine (SFSafariViewController / Chrome Custom Tabs) — best WebRTC compatibility | Separate browser chrome; completion detected via redirect/deep link | You want maximum reliability for the video call |

**Recommendation:** ship Assisted with **in-app browser mode** unless you have
verified embedded WebRTC on your device matrix.

### Embedded WebView

```tsx
import { VideoIdAssistedSession } from '@trustcloud/react-native-sdk';

<VideoIdAssistedSession
  url={session.url}
  landingUrl={session.landingUrl}
  onSuccess={() => confirmResult(session.reference)}
  onCancel={() => navigateBack()}
  onError={(e) => showError(e.message)}
  style={{ flex: 1 }}
/>
```

### In-app browser (recommended)

```tsx
import { openTrustCloudSession } from '@trustcloud/react-native-sdk';

async function startAssisted(session) {
  const result = await openTrustCloudSession({
    url: session.url,
    landingUrl: session.landingUrl,
    landingKoUrl: session.landingKoUrl,
    mode: 'in-app-browser',
  });
  // result.outcome: 'success' | 'failure' | 'cancel'
  if (result.outcome === 'success') confirmResult(session.reference);
}
```

`openTrustCloudSession` opens the URL in the system in-app browser and resolves
when the browser redirects to your landing URL or the user dismisses it. For
reliable redirect capture, register a **deep link** (universal link / app link)
as your landing URL so the OS hands control back to your app. See
[Handling results](../handling-results.md#deep-link-completion).

## What "success" means here

The user reaching `landingUrl` means the **call ended and returned** — it does
not by itself mean the agent approved them. Fetch the authoritative status
server-side (assisted exposes several status/get endpoints keyed by
`trustCloudFileId`, `videoIdentificationId`, or your `clientReference`). See
[Handling results](../handling-results.md).

## Configuration

Call routing and behaviour (call center site, mandatory pre-call test, generator
type, landing URL) are set on the **create call** in your backend — fields like
`callcenter`, `preCallTest`, and `typeOfGenerator`. Nothing about the call is
configured in the app.

## Tips

- Warn the user they'll join a live call and to be somewhere quiet with good
  signal.
- Assisted calls depend on agent availability / opening hours — surface a
  friendly message if the queue is closed (your backend can check this).
- Test on **real devices** on both cellular and Wi-Fi; the simulator has no
  camera.
