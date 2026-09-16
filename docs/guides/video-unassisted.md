# Guide: VideoID Unassisted

Self-service identity verification: the user scans their ID document and passes a
selfie/liveness check, with no agent involved. Typically completes in ~2 minutes.
This flow runs **excellently in an embedded WebView**.

## Prerequisites

- Camera + microphone permissions configured — see [Platform setup](../platform-setup.md).
- A backend endpoint that creates an unassisted session — see
  [Backend: creating a session](../backend-session-creation.md#videoid-unassisted).

## Full example

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { VideoIdUnassistedSession } from '@idvia/react-native-sdk';
import { ensureMediaPermissions } from '../permissions';

export function UnassistedScreen({ onDone }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    (async () => {
      const ok = await ensureMediaPermissions();
      if (!ok) return onDone({ status: 'permission_denied' });
      const res = await fetch('https://your-backend.example.com/idvia/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: 'unassisted' }),
      });
      setSession(await res.json());
    })();
  }, []);

  if (!session) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <VideoIdUnassistedSession
      url={session.url}
      landingUrl={session.landingUrl}
      landingKoUrl={session.landingKoUrl}
      onSuccess={() => onDone({ status: 'reached_ok', reference: session.reference })}
      onFailure={() => onDone({ status: 'reached_ko', reference: session.reference })}
      onCancel={() => onDone({ status: 'cancelled' })}
      onError={(e) => onDone({ status: 'error', message: e.message })}
      style={{ flex: 1 }}
    />
  );
}
```

## What "success" means here

The unassisted flow redirects to your `landingURL` when the **user finishes** and
to `landingKoUrl` on abandonment/expiry. That tells you the *session ended* — it
does **not** tell you whether the identity check passed. The verdict is produced
by Idvia's engine afterwards.

Confirm the real outcome server-side. The relevant webhook is
`IdviaVideoIDUnassisted`, whose `Message` is `OK`, `KO: USER ABANDONED`,
`KO: VIDEOIDENTIFICATION DATE EXPIRED`, etc. Evidence and the final engine
verdict arrive via the `EvidenceVaulted` and `EngineVerificationCompleted`
events. See [Handling results](../handling-results.md).

## Configuration

All flow behaviour (liveness engine, face matching, document types, workflow
order, expiry, look & feel) is configured **on the create call in your backend**,
not in the app. That keeps the mobile integration stable — you can change the
verification policy without an app release. Relevant create-time fields include
`useActiveLifeLivenessEngine`, `checkForFaceMatching`,
`faceMatchSimilarityThreshold`, `slaExpirationSeconds`, and `workflow`. See the
Idvia VideoID Unassisted API reference for the full list.

## Tips

- Show your own "Get ready — good lighting, have your ID" screen before mounting
  the session; the flow starts the camera immediately.
- Set a reasonable `slaExpirationSeconds` on the backend so stale URLs can't be
  reused.
- Handle `onCancel` gracefully — users sometimes background the app mid-scan.
