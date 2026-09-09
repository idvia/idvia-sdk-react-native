# Getting started

## Requirements

- React Native `0.71+` (bare) or Expo SDK `49+` with a **custom dev client**
  (the SDK needs native camera/microphone permissions, which Expo Go cannot
  grant).
- A TrustCloud / Idvia **use case** provisioned for the flow(s) you want, with
  `client_id`, `client_secret`, and an API key.
- A **backend endpoint you control** that creates sessions (see
  [Backend: creating a session](backend-session-creation.md)). The app must
  never hold your `client_secret`.

## Install

```bash
npm install @trustcloud/react-native-sdk react-native-webview
# or
yarn add @trustcloud/react-native-sdk react-native-webview
```

`react-native-webview` is a **peer dependency** — you install it in your app so
you control its version.

For the optional in-app-browser mode (recommended for the Assisted flow), also
install one of:

```bash
npm install react-native-inappbrowser-reborn   # bare RN
# or
npx expo install expo-web-browser              # Expo
```

### iOS

```bash
cd ios && pod install && cd ..
```

### Native permissions

The video flows need camera + microphone access. This is **not optional** — a
flow will show a black camera view without it. Do the one-time platform setup in
[Platform setup](platform-setup.md) before running a video flow.

The **Sign** flow needs no camera/mic permissions.

## Your first flow

The pattern is always the same three steps.

### 1. Ask your backend for a session

Your backend calls TrustCloud, creates the process, and returns the URL plus the
landing URLs it registered.

```ts
async function createSession(flow: 'unassisted' | 'assisted' | 'sign') {
  const res = await fetch('https://your-backend.example.com/trustcloud/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${appToken}` },
    body: JSON.stringify({ flow, user: { name: 'Ada Lovelace' } }),
  });
  if (!res.ok) throw new Error('Could not create session');
  return res.json() as Promise<{
    url: string;
    landingUrl: string;
    landingKoUrl: string;
    reference: string; // your correlation id to fetch the result later
  }>;
}
```

> **No backend yet?** For development/pilot you can create the session
> directly in the app with [`TrustCloudClient`](client.md) — it holds your
> credentials in the app binary, so read the security warning there before
> shipping.

### 2. Render the session

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { TrustCloudSession } from '@trustcloud/react-native-sdk';

export function VerifyScreen() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    createSession('unassisted').then(setSession);
  }, []);

  if (!session) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <TrustCloudSession
      url={session.url}
      landingUrl={session.landingUrl}
      landingKoUrl={session.landingKoUrl}
      onSuccess={() => confirmResult(session.reference)}
      onFailure={() => showRetry()}
      onCancel={() => navigateBack()}
      onError={(e) => showError(e.message)}
      style={{ flex: 1 }}
    />
  );
}
```

### 3. Confirm the result server-side

`onSuccess` only means the user reached your success page. Ask your backend for
the **authoritative** result (it knows from TrustCloud webhooks / status calls):

```ts
async function confirmResult(reference: string) {
  const res = await fetch(`https://your-backend.example.com/trustcloud/results/${reference}`);
  const { status } = await res.json(); // e.g. 'VERIFIED' | 'REJECTED' | 'PENDING'
  // update your UI based on the real status
}
```

See [Handling results](handling-results.md) for the full picture.

## Where to go next

- Flow guides: [Unassisted](guides/video-unassisted.md) ·
  [Assisted](guides/video-assisted.md) · [Sign](guides/sign.md)
- [API reference](api-reference.md) for every prop and type.
- [Troubleshooting](troubleshooting.md) if the camera is black or the flow won't
  load.
