# IdviaClient — calling the APIs from the app

> **⚠️ Security trade-off — read first.** `IdviaClient` embeds your
> `client_id` and `client_secret` in the mobile app. Anything shipped in an app
> binary can be extracted, so this mode is a **development / pilot
> convenience**. For production, the recommended model remains
> [backend session creation](backend-session-creation.md): your server holds
> the credentials and the app only receives a session URL. The SDK's rendering
> layer is identical in both models — migrating later means replacing the
> client calls with a fetch to your backend and changing nothing else.

## Setup

```ts
import { IdviaClient } from '@idvia/react-native-sdk';

const client = new IdviaClient({
  environment: 'pre', // or 'pro'
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  useCaseIds: {
    videoIdUnassisted: '...',
    videoIdAssisted: '...',
    sign: '...',
  },
});
```

Every method also accepts a per-call `useCaseId` override. An optional
`urls: { orchestrator?, identityServer? }` config overrides the environment
presets. Authentication is automatic: the client requests a
`client_credentials` token on first use, caches it in memory, renews it near
expiry, and retries once on a 401.

## Creating sessions

```ts
// VideoID Unassisted
const un = await client.createVideoIdUnassisted({
  clientReference: 'your-correlation-id',
  docType: 'Id', // mandatory: 'Id', 'Passport', 'DriversLicense', …
  landingUrl: 'https://app.example.com/tc/ok',
  landingKoUrl: 'https://app.example.com/tc/ko',
  // optional tuning — sent as the API's nested `configuration` object
  configuration: { language: 'ES', slaExpirationSeconds: 3600 },
});
// → { url, trustCloudFileId, videoIdentificationId }
// The client always sends the mandatory `configuration` object, placing
// landingUrl/landingKoUrl inside it as the API expects.

// VideoID Assisted
const as = await client.createVideoIdAssisted({
  clientReference: 'your-correlation-id',
  serviceCountry: 'ES', // mandatory: ISO 3166-1 alpha-2
  language: 'es', // mandatory: ISO 639-1 alpha-2
  name: 'Ada', // some use cases reject the call without name/surname
  surname: 'Lovelace',
  landingUrl: 'https://app.example.com/tc/ok',
});
// → { url, trustCloudFileId, videoIdentificationId }

// Sign (two-step create + get-URL in one call)
const sg = await client.createSignSession({
  signers: [{ clientReference: 'signer-1', name: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'SIGNER' }],
  documents: [{ url: 'https://your-host/document.pdf' }],
});
// → { url, trustCloudFileId }
// (createSign and getSignUrl are also available separately; the signing URL
// is fetched for the first signer's clientReference unless you pass
// identityClientReference explicitly)
```

Pass the returned `url` (plus your landing URLs) straight to
`<IdviaSession>` or `openIdviaSession` — see
[Getting started](getting-started.md). All documented request fields are
typed; additional fields (`docNumber`, `callcenter`, unassisted
`configuration` entries like `useActiveLifeLivenessEngine`, …) pass through
as-is.

## Checking results

The client-side callback is a UX signal; confirm the authoritative result via
the status endpoints:

```ts
await client.getVideoIdUnassistedStatus({ trustCloudFileId, videoIdentificationId });
await client.getVideoIdAssistedStatus({ trustCloudFileId });
await client.getSignStatus({ trustCloudFileId }); // → { status: 'Completed' | 'Pending' | 'Cancelled' }
```

Unassisted verdicts can arrive a few seconds after the user finishes — poll
until the status settles. See [Handling results](handling-results.md).

## Errors

API failures throw `IdviaApiError` with `status` (HTTP), `endpoint`, and
`body` (the parsed response). The client secret never appears in errors or
logs.
