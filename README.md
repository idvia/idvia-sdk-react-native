# @idvia/react-native-sdk

React Native SDK for Idvia **VideoID Unassisted**, **VideoID Assisted**, and
**Sign** flows: a typed API client plus a managed-WebView rendering layer.

- Renders the hosted Idvia flows inside your app and reports the outcome
  through typed callbacks.
- Fences navigation and camera/microphone access to Idvia hosts.
- No native code of its own: `react-native-webview` is the only required peer.

## Install

```bash
npm install @idvia/react-native-sdk react-native-webview
```

Then complete the one-time native setup (camera/microphone permissions) in
[Platform setup](docs/platform-setup.md).

## Minimal usage

```tsx
import { IdviaSession } from '@idvia/react-native-sdk';

// `url` and `landingUrl` come from your backend, which creates the session
// with your credentials (see docs/backend-session-creation.md).
<IdviaSession
  url={session.url}
  landingUrl={session.landingUrl}
  onSuccess={(r) => console.log('completed', r.params)}
  onFailure={(r) => console.log('failed', r.params)}
  onCancel={() => console.log('cancelled by the user')}
  onError={(e) => console.warn(e.code, e.message)}
/>
```

The client-side outcome is a UX signal only: confirm the result from your
backend with the status endpoints or webhooks.

## Documentation

| Read | For |
|------|-----|
| [Getting started](docs/getting-started.md) | Install, permissions, first flow |
| [Guides](docs/guides/) | Unassisted, Assisted and Sign step by step |
| [Backend: creating a session](docs/backend-session-creation.md) | The production pattern (credentials stay server-side) |
| [API reference](docs/api-reference.md) | Props, hooks, types, error codes |
| [Handling results](docs/handling-results.md) | Landing URLs, status endpoints, webhooks |
| [Troubleshooting](docs/troubleshooting.md) | Black camera, permission prompts, WebView debugging |

A runnable Expo dev-client app exercising the three flows against the real
APIs is in [`example/`](example/README.md).

## Requirements

React Native 0.71+ (bare) or Expo SDK 49+ with a custom dev client. A real
device is required for the video flows (emulators have no camera).

## Support

Integration questions and bug reports:
[github.com/idvia/idvia-sdk-react-native/issues](https://github.com/idvia/idvia-sdk-react-native/issues).
Security issues: see [SECURITY.md](SECURITY.md).

## License

Proprietary. Use of this SDK requires a service agreement with Idvia; see
[LICENSE](LICENSE).
