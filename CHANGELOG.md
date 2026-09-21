# Changelog

## 0.2.1

### Changed
- `createSignSession`: the embedded URL is never ready right after the create call, so the
  first `getSignUrl` poll now waits 5 s (new option `urlInitialDelayMs`); it then polls every
  3 s until 45 s have elapsed (`urlRetries` default 15 → 14). Saves one guaranteed 400 per
  session; the total wait is unchanged.

## 0.2.0

Verified end to end on a real Android device against PRE (Unassisted, Assisted, Sign).

### Distribution
- First release on the public npm registry: `npm install @idvia/react-native-sdk`.
- Proprietary `LICENSE` and `SECURITY.md` added; maintainer documentation moved to `CONTRIBUTING.md`.

### Breaking (types only)
- `CreateVideoIdUnassistedParams.docNumber` is now required (the API rejects an empty value).
- `CreateVideoIdAssistedParams.docType` and `docNumber` are now required.
- Package renamed to `@idvia/react-native-sdk`; all `TrustCloud*` identifiers are now `Idvia*`
  (`IdviaClient`, `IdviaSession`, `IdviaApiError`, ...). Wire format is unchanged.

### Fixed
- `createSign`: the API returns the `trustCloudFileId` as a bare string; it was read as `undefined`.
- `createSignSession`: polls `getSignUrl` while the embedded ceremony is being built
  (`400 No url found for operation`, 5-20 s observed). New options `urlRetries` (15) and
  `urlRetryDelayMs` (3000).
- `createVideoIdUnassisted`: the API returns `videoidentificationId` (lowercase i); the id was
  `undefined`, which broke `getVideoIdUnassistedStatus`.
- Sign types: `SignSignature`, `SignPosition`, `SignReminders`, `signatures`, `autoClose`,
  `signMode: 'EMBEBED'` documented as what an embedded ceremony needs.

### Security
- Main-frame navigation is fenced to the flow's own hosts plus `DEFAULT_ALLOWED_HOSTS`; anything
  else opens in the system browser instead of inside the WebView (new prop `allowedHosts`).
- `mediaPermissions` now has an effect: `grantIfSameHostElsePrompt` / `deny` (iOS). The Android
  `onPermissionRequest` handler was dead code and is gone; see the API reference note.
- `webViewProps` can no longer override `javaScriptEnabled`, `originWhitelist`, `mixedContentMode`
  or `mediaCapturePermissionGrantType`; `onShouldStartLoadWithRequest` and
  `injectedJavaScriptBeforeContentLoaded` are composed with the SDK's own.

### Docs / example
- Payloads that the API actually accepts for the three flows; Sign create body with `signatures`.
- Example app sends the mandatory document fields and an embedded Sign envelope.
