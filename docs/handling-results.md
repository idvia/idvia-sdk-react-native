# Handling results

> **The single most important rule of this SDK:** the client-side callback is a
> **UX signal**, never the verdict. Decide access, approval, or legal validity
> **only** from a server-confirmed result.

## Why the client can't be trusted

The SDK detects completion by watching for navigation to your `landingUrl`. That
proves the user *reached* a page — it does not prove the identity check passed,
the liveness was genuine, or the signature is legally complete. A landing URL can
be reached by:

- a genuine successful completion,
- a user who abandoned and got redirected to a KO page,
- someone manipulating the WebView / deep link.

The real outcome is computed by Idvia's backend and delivered to **your**
backend. Use the client callback to update the UI ("thanks, we're checking…") and
the server result to make decisions.

## Two ways to get the authoritative result

### 1. Webhooks (recommended)

Idvia POSTs events to a callback URL configured for your use case. Your
backend records them, keyed by `clientReference` / `trustCloudFileId`, and your
app reads them back via your own endpoint.

**VideoID Unassisted events:**

| Event | Meaning |
|-------|---------|
| `IdviaVideoIDUnassisted` | Flow finished/abandoned. `Message` = `OK`, `KO: USER ABANDONED`, `KO: VIDEOIDENTIFICATION DATE EXPIRED`, … |
| `EvidenceVaulted` | A piece of evidence (image, video) was stored. Fires multiple times. |
| `EngineVerificationCompleted` | The AI engine finished; the final verdict is available. |

Example `IdviaVideoIDUnassisted` payload:

```json
{
  "VideoUnassistedIdentificationId": "caeb2d39-...",
  "Status": "IdviaVideoIDUnassisted",
  "IdviaFileId": "7177dc4e-...",
  "UseCaseId": "5f9143c5-...",
  "ClientReference": "your-correlation-id",
  "Message": "OK",
  "Metadata": null
}
```

**Recommended retrieval flow (unassisted):** wait for evidence to be vaulted,
then call the *Retrieve Results* endpoint once `EngineVerificationCompleted`
arrives — that's when the complete, final result is ready.

**Sign** and **Assisted** emit their own completion events; record them the same
way and expose a normalized status to your app.

### 2. Polling the status endpoints

If you don't run webhooks, poll on the server after the app reports `onSuccess`:

| Flow | Status endpoint (preproduction) |
|------|-------------------------------|
| Unassisted | `GET /api/v1/videoIdUnassisted/useCase/{useCaseId}/trustCloudFile/{tcFileId}/videoIdentification/{videoIdentificationId}/getVideoIdentification` |
| Assisted | `GET /api/v2/videoid/usecaseid/{useCaseId}/trustcloudfileid/{tcFileId}/status` (also by `videoIdentificationId` or `clientReference`) |
| Sign | `GET /api/v1/sign/useCase/{useCaseId}/trustCloudFile/{tcFileId}/status` → `{ "status": "Completed" \| "Pending" \| "Cancelled" }` |

Poll from your **backend**, not the app (the app has no Idvia token). (For
development and pilot integrations using [IdviaClient](client.md), the
app does hold a token and may poll the status endpoints directly — see that
page's security warning.)

## The app's role

```ts
// After onSuccess: don't decide anything yet — confirm with your backend.
async function confirmResult(reference: string) {
  // your backend returns a normalized status it derived from webhooks/polling
  const res = await fetch(`https://your-backend.example.com/idvia/results/${reference}`);
  const { status } = await res.json(); // 'VERIFIED' | 'REJECTED' | 'PENDING' | 'SIGNED' | ...
  switch (status) {
    case 'PENDING': return showChecking();   // engine still running
    case 'VERIFIED':
    case 'SIGNED':  return showApproved();
    default:        return showRejected();
  }
}
```

Because `EngineVerificationCompleted` can arrive shortly **after** the user
finishes, your `results` endpoint may legitimately return `PENDING` right after
`onSuccess`. Poll or subscribe until it settles; show a "we're verifying…" state
in the meantime.

## Deep-link completion

When you use the in-app-browser mode (`openIdviaSession`), completion is
detected when the browser redirects to your `landingUrl`. For the OS to hand
control back to your app, register that URL as a **universal link (iOS)** / **app
link (Android)** pointing at your app, or use a custom URL scheme. The SDK
resolves its promise when it receives that redirect.
