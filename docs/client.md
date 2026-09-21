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
  docType: 'Id', // mandatory: 'Id', 'Passport', 'DrivingLicense', 'ResidencePermit', …
  docNumber: '12345678Z', // mandatory and non-empty
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
  docType: 'Id', // mandatory
  docNumber: '12345678Z', // mandatory and non-empty
  landingUrl: 'https://app.example.com/tc/ok',
});
// → { url, trustCloudFileId, videoIdentificationId }

// Sign (create + get-URL in one call; the SDK polls for the embedded URL, which the
// provider produces a few seconds after the envelope is created)
const signerId = uuid(); // any UUID you generate
const documentId = uuid();
const sg = await client.createSignSession({
  clientReference: 'your-correlation-id',
  autoClose: true,
  signers: [{
    id: signerId,
    order: 1,
    role: 'SIGNER',
    signMode: 'EMBEBED', // API spelling; required for an in-app ceremony
    authenticationMethod: 'NONE',
    clientReference: 'signer-1',
    name: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  }],
  documents: [{ id: documentId, base64: '<PDF as base64>', fileName: 'contract.pdf' }],
  // links each signer to each document and places the signature (text anchor and/or x/y)
  signatures: [{ documentId, identityId: signerId, positions: [{ anchor: 'Sign here:', x: 30, y: 30 }], type: 'SIGNER' }],
});
// → { url, trustCloudFileId }
// (createSign and getSignUrl are also available separately; the signing URL
// is fetched for the first signer's clientReference unless you pass
// identityClientReference explicitly. The url endpoint answers 400 "No url found
// for operation" until the ceremony exists; createSignSession waits 5 s and then
// polls it every 3 s for up to 45 s — tune with urlInitialDelayMs / urlRetries /
// urlRetryDelayMs.)
```

Pass the returned `url` (plus your landing URLs) straight to
`<IdviaSession>` or `openIdviaSession` — see
[Getting started](getting-started.md). All documented request fields are
typed; additional fields (`callcenter`, unassisted
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
