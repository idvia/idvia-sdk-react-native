# API reference

## Components

### `<TrustCloudSession>`

The core component. Renders a session URL in a hardened WebView and reports the
outcome. The flow-specific aliases below are identical except for defaults and
result typing.

- `<VideoIdUnassistedSession>`
- `<VideoIdAssistedSession>`
- `<SignSession>`

The API client used to create sessions in-app is documented in
[TrustCloudClient](client.md).

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | ✅ | The session URL created by your backend. |
| `landingUrl` | `string` | ✅ | The URL the flow redirects to on completion. Navigation to it triggers `onSuccess`. |
| `landingKoUrl` | `string` | — | The URL for the KO/failure path. Navigation to it triggers `onFailure`. Omit if the flow uses a single landing URL. |
| `onSuccess` | `(result: TrustCloudResult) => void` | — | Fired when navigation reaches `landingUrl`. |
| `onFailure` | `(result: TrustCloudResult) => void` | — | Fired when navigation reaches `landingKoUrl`. |
| `onCancel` | `() => void` | — | Fired when the user dismisses the flow (e.g. hardware back, close button). |
| `onError` | `(error: TrustCloudError) => void` | — | Fired on load failure, permission denial, or invalid URL. |
| `onNavigationEvent` | `(event: TrustCloudNavigationEvent) => void` | — | Low-level: every navigation the WebView attempts. For diagnostics. |
| `renderLoading` | `() => React.ReactElement` | — | Custom loading UI shown while the flow loads. |
| `mediaPermissions` | `boolean` | — | Default `true`. Auto-grant camera/mic to the WebView. Set `false` for Sign-only screens. |
| `loadTimeoutMs` | `number` | — | Default `30000`. If the first load hasn't completed in time, `onError` fires with `TIMEOUT`. |
| `style` | `ViewStyle` | — | Passed to the container. Usually `{ flex: 1 }`. |
| `webViewProps` | `Record<string, unknown>` | — | Escape hatch to override underlying `react-native-webview` props. Typed loosely (not `Partial<WebViewProps>`) because the webview types come from an optional peer dependency; values are passed through untyped to the underlying `WebView`. |

> **`mediaPermissions` is best-effort.** On current `react-native-webview`
> Android versions, `getUserMedia` grants are auto-managed by the library
> based on the app's OS-level camera/mic permissions — there is no reliable
> JS-level `onPermissionRequest` hook exposed for integrators to intercept
> this decision. Setting `mediaPermissions={false}` asks the WebView to deny
> the page's request, but do not treat it as the access-control boundary:
> gate camera/mic access by requesting (or withholding) the runtime
> permissions per [Platform setup](platform-setup.md) instead.

## Imperative API

### `openTrustCloudSession(options): Promise<TrustCloudResult>`

Opens a session in an **in-app browser** (SFSafariViewController / Chrome Custom
Tabs) or a modal WebView, and resolves with the outcome. Recommended for the
Assisted flow — see [Guide: Assisted](guides/video-assisted.md#webview-vs-in-app-browser).

```ts
type OpenOptions = {
  url: string;
  landingUrl: string;
  landingKoUrl?: string;
  mode?: 'in-app-browser' | 'webview'; // default 'webview'
};

const result = await openTrustCloudSession(options);
```

Calling `openTrustCloudSession` in `'webview'` mode while another
`'webview'`-mode session is already presenting **supersedes** it: the
superseded call's promise resolves `{ outcome: 'cancel' }`.

### `<TrustCloudPortal>`

Required for `openTrustCloudSession`'s default `'webview'` mode: render it
**once at your app root** (e.g. the bottom of `App.tsx`). It hosts the modal
WebView the imperative call presents. Calling `openTrustCloudSession` with
mode `'webview'` and no portal mounted rejects with `PORTAL_NOT_MOUNTED`.

## Hook

### `useTrustCloudSession()`

Convenience state machine for the imperative flow.

```ts
const { status, result, error, present } = useTrustCloudSession();
// status: 'idle' | 'presenting' | 'success' | 'failure' | 'cancel' | 'error'
await present({ url, landingUrl, landingKoUrl, mode: 'in-app-browser' });
```

The hook guards against out-of-order results: if `present()` is called again
before a prior call has settled, only the most recent call's outcome updates
`status`, `result`, and `error` — a stale response from an earlier call is
discarded.

## Types

### `TrustCloudResult`

```ts
type TrustCloudOutcome = 'success' | 'failure' | 'cancel';

interface TrustCloudResult {
  outcome: TrustCloudOutcome;
  /** The full URL that was intercepted, including query string. */
  landingUrl?: string;
  /** Parsed query params from the landing URL (provider-dependent). */
  params?: Record<string, string>;
}
```

> **`params` are advisory.** Providers may append query parameters to the landing
> URL, but you must not rely on them as proof of outcome — confirm server-side.

### `TrustCloudError`

```ts
type TrustCloudErrorCode =
  | 'LOAD_FAILED'          // the URL failed to load (network, 4xx/5xx)
  | 'PERMISSION_DENIED'    // camera/mic permission was refused
  | 'INVALID_URL'          // url/landingUrl missing or malformed
  | 'TIMEOUT'              // the flow did not load within the timeout
  | 'WEBVIEW_UNSUPPORTED'  // react-native-webview not installed/linked
  | 'BROWSER_UNSUPPORTED'  // in-app-browser mode: no browser module installed
  | 'PORTAL_NOT_MOUNTED';  // webview mode: <TrustCloudPortal /> is not rendered

interface TrustCloudError {
  code: TrustCloudErrorCode;
  message: string;
  nativeError?: unknown;
}
```

> **`PERMISSION_DENIED` is best-effort.** It fires when `mediaPermissions` is
> `false` and the page still asks for the camera/mic — see the note on
> `mediaPermissions` above. On current `react-native-webview` Android
> versions the underlying grant/deny decision is made by the library from the
> app's OS-level permissions, so this code is not a substitute for handling
> runtime permissions per [Platform setup](platform-setup.md).

### `TrustCloudNavigationEvent`

```ts
interface TrustCloudNavigationEvent {
  url: string;
  loading: boolean;
  canGoBack: boolean;
}
```

## Outcome mapping

| What happened | Callback | `outcome` |
|---------------|----------|-----------|
| Navigation reached `landingUrl` | `onSuccess` | `success` |
| Navigation reached `landingKoUrl` | `onFailure` | `failure` |
| User dismissed the flow | `onCancel` | `cancel` |
| Load / permission / config failure | `onError` | — (`TrustCloudError`) |

All outcomes are **UX signals**. The authoritative verification/signature result
is always confirmed server-side — see [Handling results](handling-results.md).
