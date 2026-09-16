# Guide: Sign

Electronic signature: the user reviews one or more documents and signs them.
Supports **Standard Electronic Signature**, **Qualified Electronic Signature
(QES)**, and accessibility signing. The signing ceremony is served by Idvia's
provider (DocuSign, Namirial, OneSpan, Signaturit, CertySign, …) — the SDK just
renders the returned URL.

**No camera or microphone required.** Sign is the simplest flow to integrate.

## Prerequisites

- The `react-native-webview` peer dependency installed (no platform permission
  setup needed).
- A backend endpoint that creates a signing session — see
  [Backend: creating a session](../backend-session-creation.md#sign). Remember Sign
  is a two-step create (create envelope → get signing URL, where the URL is
  returned in the `message` field).

## Full example

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SignSession } from '@idvia/react-native-sdk';

export function SignScreen({ documentRef, onDone }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    fetch('https://your-backend.example.com/idvia/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow: 'sign', documentRef }),
    })
      .then((r) => r.json())
      .then(setSession);
  }, [documentRef]);

  if (!session) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SignSession
      url={session.url}
      landingUrl={session.landingUrl}
      onSuccess={() => onDone({ status: 'signed', reference: session.reference })}
      onCancel={() => onDone({ status: 'cancelled' })}
      onError={(e) => onDone({ status: 'error', message: e.message })}
      style={{ flex: 1 }}
    />
  );
}
```

## What "success" means here

Reaching `landingUrl` means the signer **finished the ceremony in the provider's
UI**. The signed document, its evidence, and the final legal status are confirmed
by Idvia server-side. Fetch the real status with the Sign status endpoints
(by `trustCloudFileId` or by `clientReference`), which return values like
`Completed`, `Pending`, or `Cancelled`. See
[Handling results](../handling-results.md).

Never treat the client redirect as proof of a completed, legally-binding
signature — always verify server-side before releasing the signed document.

## Signature types

Which type of signature (Standard / QES / accessibility) and its rules (signer
order, form fields, reminders, expiry) are all defined on the **create call** in
your backend. The app renders whatever ceremony the provider serves for that
envelope; nothing type-specific is configured in the app.

- **QES** may add extra identity steps inside the ceremony (e.g. an OTP or an
  identity check). These still happen inside the same WebView URL — no extra SDK
  work.

## Multiple signers

Each signer has their own `identityClientReference` and their own signing URL.
For an in-person "sign on this device" flow, create the session per signer and
render each URL in turn. For remote signers, Idvia emails them a link — you
don't render anything in-app for those.

## Tips

- Show a short "You're about to sign X" summary before mounting the session.
- Sign works identically in embedded WebView and in-app browser; embedded is fine
  since there's no WebRTC.
- Large PDFs load inside the ceremony — show the SDK's loading indicator
  (`renderLoading`) so the screen isn't blank while the provider page loads.
