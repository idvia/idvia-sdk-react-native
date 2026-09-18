# API reference

## Components

### `<IdviaSession>`

The core component. Renders a session URL in a hardened WebView and reports the
outcome. The flow-specific aliases below are identical except for defaults and
result typing.

- `<VideoIdUnassistedSession>`
- `<VideoIdAssistedSession>`
- `<SignSession>`

The API client used to create sessions in-app is documented in
[IdviaClient](client.md).

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | ✅ | The session URL created by your backend. |
| `landingUrl` | `string` | ✅ | The URL the flow redirects to on completion. Navigation to it triggers `onSuccess`. |
| `landingKoUrl` | `string` | — | The URL for the KO/failure path. Navigation to it triggers `onFailure`. Omit if the flow uses a single landing URL. |
| `onSuccess` | `(result: IdviaResult) => void` | — | Fired when navigation reaches `landingUrl`. |
| `onFailure` | `(result: IdviaResult) => void` | — | Fired when navigation reaches `landingKoUrl`. |
| `onCancel` | `() => void` | — | Fired when the user dismisses the flow (e.g. hardware back, close button). |
| `onError` | `(error: IdviaError) => void` | — | Fired on load failure, permission denial, or invalid URL. |
| `onNavigationEvent` | `(event: IdviaNavigationEvent) => void` | — | Low-level: every navigation the WebView attempts. For diagnostics. |
| `renderLoading` | `() => React.ReactElement` | — | Custom loading UI shown while the flow loads. |
| `mediaPermissions` | `boolean` | — | Default `true`. Auto-grant camera/mic to the page's own host (iOS: `grantIfSameHostElsePrompt`). Set `false` for Sign-only screens (iOS: `deny`). See the note below for Android. |
| `allowedHosts` | `readonly string[]` | — | Extra hosts the **main frame** may navigate to inside the WebView, as exact hosts or `*.example.com`. Added to `DEFAULT_ALLOWED_HOSTS` (`*.trustcloud.solutions`, `*.trustcloud.com`, `*.idvia.com`) and to the hosts of `url`, `landingUrl` and `landingKoUrl`. Any other main-frame navigation is blocked and opened in the system browser, so a page reached through a link or an open redirect never runs with this WebView's camera/mic grants or cookies. Iframes are not fenced. |
| `loadTimeoutMs` | `number` | — | Default `30000`. If the first load hasn't completed in time, `onError` fires with `TIMEOUT`. |
| `style` | `ViewStyle` | — | Passed to the container. Usually `{ flex: 1 }`. |
| `webViewProps` | `Record<string, unknown>` | — | Escape hatch spread onto the underlying `react-native-webview`. Typed loosely (not `Partial<WebViewProps>`) because the webview types come from an optional peer dependency. **Not overridable:** `javaScriptEnabled`, `originWhitelist`, `mixedContentMode`, `mediaCapturePermissionGrantType`. **Composed:** your `onShouldStartLoadWithRequest` runs first and a `false` blocks the load, but the SDK's landing detection and host allowlist always run after it; your `injectedJavaScriptBeforeContentLoaded` runs after the SDK's permissions shim, not instead of it. |

> **Android has no per-origin camera/mic hook.** `react-native-webview` grants
> `getUserMedia` on Android whenever the app holds the OS-level camera/mic
> permission, for any page the WebView loads; `mediaCapturePermissionGrantType`
> (and therefore `mediaPermissions`) only takes effect on iOS. On Android the
> control is the host allowlist: only the flow's own hosts can be reached in the
> main frame, so nothing else ever runs inside this WebView. For Sign-only
> screens on Android, additionally do not request the camera/mic runtime
> permissions (see [Platform setup](platform-setup.md)).

## Imperative API

### `openIdviaSession(options): Promise<IdviaResult>`

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

const result = await openIdviaSession(options);
```

Calling `openIdviaSession` in `'webview'` mode while another
`'webview'`-mode session is already presenting **supersedes** it: the
superseded call's promise resolves `{ outcome: 'cancel' }`.

### `<IdviaPortal>`

Required for `openIdviaSession`'s default `'webview'` mode: render it
**once at your app root** (e.g. the bottom of `App.tsx`). It hosts the modal
WebView the imperative call presents. Calling `openIdviaSession` with
mode `'webview'` and no portal mounted rejects with `PORTAL_NOT_MOUNTED`.

## Hook

### `useIdviaSession()`

Convenience state machine for the imperative flow.

```ts
const { status, result, error, present } = useIdviaSession();
// status: 'idle' | 'presenting' | 'success' | 'failure' | 'cancel' | 'error'
await present({ url, landingUrl, landingKoUrl, mode: 'in-app-browser' });
```

The hook guards against out-of-order results: if `present()` is called again
before a prior call has settled, only the most recent call's outcome updates
`status`, `result`, and `error` — a stale response from an earlier call is
discarded.

## Types

### `IdviaResult`

```ts
type IdviaOutcome = 'success' | 'failure' | 'cancel';

interface IdviaResult {
  outcome: IdviaOutcome;
  /** The full URL that was intercepted, including query string. */
  landingUrl?: string;
  /** Parsed query params from the landing URL. User-controllable: never trust them as a verdict. */
  params?: Record<string, string>;
}
```

> **`params` are advisory.** Providers may append query parameters to the landing
> URL, but you must not rely on them as proof of outcome — confirm server-side.

### `IdviaError`

```ts
type IdviaErrorCode =
  | 'LOAD_FAILED'          // the URL failed to load (network, 4xx/5xx)
  | 'PERMISSION_DENIED'    // camera/mic permission was refused
  | 'INVALID_URL'          // url/landingUrl missing or malformed
  | 'TIMEOUT'              // the flow did not load within the timeout
  | 'WEBVIEW_UNSUPPORTED'  // react-native-webview not installed/linked
  | 'BROWSER_UNSUPPORTED'  // in-app-browser mode: no browser module installed
  | 'PORTAL_NOT_MOUNTED';  // webview mode: <IdviaPortal /> is not rendered

interface IdviaError {
  code: IdviaErrorCode;
  message: string;
  nativeError?: unknown;
}
```

> **`PERMISSION_DENIED` is reserved.** The SDK no longer emits it: the
> camera/mic decision is made natively (iOS: by `mediaCapturePermissionGrantType`,
> Android: from the app's runtime permissions) and never reaches JavaScript. The
> code stays in the union for compatibility.

### `IdviaNavigationEvent`

```ts
interface IdviaNavigationEvent {
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
| Load / permission / config failure | `onError` | — (`IdviaError`) |

All outcomes are **UX signals**. The authoritative verification/signature result
is always confirmed server-side — see [Handling results](handling-results.md).
