# Backend: creating a session

The SDK renders a **session URL**. That URL must be created on **your backend**,
because creating it requires your Idvia `client_secret`, which must never
ship in a production mobile app. (For development and pilot integrations the
SDK offers an in-app alternative — see [IdviaClient](client.md) and its
security warning.)

This page shows the exact Idvia calls your backend makes for each flow. Endpoints
below use the **preproduction** host; swap the host for production.

| Environment | Orchestrator base URL | Token endpoint |
|-------------|----------------------|----------------|
| Preproduction | `https://orchestrator-pre.trustcloud.solutions` | `https://identityserver-pre.trustcloud.solutions/IdentityServer/connect/token` |
| Production | `https://orchestrator.trustcloud.solutions` | `https://identityserver.trustcloud.solutions/connect/token` |

## Step 0 — Get an access token (all flows)

```http
POST https://identityserver-pre.trustcloud.solutions/IdentityServer/connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET
```

Response:

```json
{ "access_token": "eyJ...", "expires_in": 3600, "token_type": "Bearer" }
```

Cache and reuse the token until it expires (~1h). Send it as
`Authorization: Bearer <access_token>` on every call below.

---

## VideoID Unassisted

**Create the process:**

```http
POST /api/v1/videoIdUnassisted/useCase/{useCaseId}/createUnassisted
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientReference": "your-correlation-id",
  "docType": "Id",
  "docNumber": "12345678Z",
  "configuration": {
    "landingURL": "https://app.example.com/tc/ok",
    "landingKoUrl": "https://app.example.com/tc/ko",
    "language": "ES",
    "slaExpirationSeconds": 3600
  }
}
```

`docType` is **mandatory** — the document type the user will present (`Id`,
`Passport`, `DrivingLicense`, `ResidencePermit`, …) — and so is `docNumber`, which
must be non-empty (the API answers 400 `'DocNumber' is Required` otherwise). The
nested `configuration` object is also
**mandatory**; the landing URLs, expiry, and all verification tuning
(`useActiveLifeLivenessEngine`, `checkForFaceMatching`, `workflow`, …) live
inside it, not at the top level.

**Response:**

```json
{
  "url": "https://videounassisted-pre.trustcloud.solutions/...",
  "trustCloudFileId": "df28f22e-c692-4c7d-b132-c1bc6a9587db",
  "videoIdentificationId": "aa6e14bc-4797-b3fc-5f27c092714b"
}
```

Return `{ url, landingUrl, landingKoUrl, reference: clientReference }` to the app.
The `url` field is what the SDK renders.

---

## VideoID Assisted

**Create the process:**

```http
POST /api/v2/videoid/usecaseid/{useCaseId}/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientReference": "your-correlation-id",
  "serviceCountry": "ES",
  "language": "es",
  "name": "Ada",
  "surname": "Lovelace",
  "docType": "Id",
  "docNumber": "12345678Z",
  "landingUrl": "https://app.example.com/tc/ok"
}
```

`serviceCountry` (ISO 3166-1 alpha-2), `language` (ISO 639-1 alpha-2), `docType`
and a non-empty `docNumber` are **mandatory** (400 `Document type is Required |
Document number is Required` otherwise); `name` and `surname` are also enforced by
some use cases. Accepted `docType` values: `Id`, `Passport`, `DrivingLicense`,
`MilitaryId`, `ResidencePermit`, `IdCard`, `NC`, `PP`, `DL`, `RP`.

**Response:**

```json
{
  "url": "https://videoid.trustcloud.com/video_assisted_url",
  "trustCloudFileId": "700b2daa-4bc1-428a-903c-beaa1698352b",
  "videoidentificationId": "f9236a42-3a83-42c2-842e-b20a0b7b9f74"
}
```

> Assisted registers a single `landingUrl` (used after the call ends). You can
> pass the same URL as both `landingUrl` and `landingKoUrl` to the SDK, or omit
> `landingKoUrl`.

---

## Sign

Sign is a **two-step** creation: create the envelope, then fetch the signing URL.

**1. Create the signature process:**

```http
POST /api/v1/sign/useCase/{useCaseId}/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientReference": "your-correlation-id",
  "autoClose": true,
  "signers": [
    {
      "id": "33c09020-9b47-4afa-8612-0dcf17bd86e6",
      "order": 1,
      "role": "SIGNER",
      "signMode": "EMBEBED",
      "authenticationMethod": "NONE",
      "clientReference": "signer-1",
      "name": "Ada",
      "lastName": "Lovelace",
      "email": "ada@example.com"
    }
  ],
  "documents": [
    { "id": "22a19020-9b47-4afa-8612-0dcf17bd86e6", "base64": "<PDF as base64>", "fileName": "contract.pdf" }
  ],
  "signatures": [
    {
      "documentId": "22a19020-9b47-4afa-8612-0dcf17bd86e6",
      "identityId": "33c09020-9b47-4afa-8612-0dcf17bd86e6",
      "positions": [{ "anchor": "Sign here:", "x": 30, "y": 30 }],
      "type": "SIGNER"
    }
  ]
}
```

The signer's `clientReference` is what step 2's `{identityClientReference}`
path segment refers to. `id` values are UUIDs you generate; `signatures` links
each signer to each document and places the signature. `signMode: "EMBEBED"`
(API spelling) is what makes the provider produce an embedded URL — without it,
or without `signatures`, the create call may succeed but no URL ever appears.
A minimal body with only `signers` and `documents` is rejected with a 500.

**Response** — the new `trustCloudFileId`, as a bare JSON string:

```json
"df28f22e-c692-4c7d-b132-c1bc6a9587db"
```

**2. Get the embedded signing URL:**

```http
GET /api/v1/sign/useCase/{useCaseId}/trustCloudFile/{trustCloudFileId}/{identityClientReference}/url
Authorization: Bearer <token>
```

The provider builds the embedded ceremony asynchronously: until it exists this
endpoint answers `400 No url found for operation` (about 5 s in practice). Poll
it every few seconds; `IdviaClient.createSignSession` does this for you.

**Response** — note the URL is in the `message` field:

```json
{
  "message": "https://demo.signingprovideracme.net/Signing/MTRedeem/v1/046d...",
  "currentDate": "2022-08-08T15:52:33Z"
}
```

Return `{ url: message, landingUrl: <your redirect>, reference: trustCloudFileId }`
to the app.

> **Redirect after signing:** the signing provider returns the user to the URL
> you configured for the use case (or use the `urlredirect` variant of the
> create call to pass one). Register that URL as the SDK's `landingUrl` so the
> SDK can detect completion.

---

## Reference backend endpoint (what the app calls)

Wrap the above behind one endpoint your app can call safely:

```
POST /idvia/sessions   →  { url, landingUrl, landingKoUrl, reference }
GET  /idvia/results/:reference  →  { status }   // reads webhook/status state
```

Your app authenticates to **your** backend (its own auth), never to Idvia
directly. See [Handling results](handling-results.md) for the result side.
