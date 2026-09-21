# Troubleshooting

## Camera is black / video flow won't start

The most common issue, always a permissions/flags problem.

- [ ] `NSCameraUsageDescription` **and** `NSMicrophoneUsageDescription` in
      `Info.plist` (iOS). Missing mic string breaks the whole flow, camera-only or
      not.
- [ ] `CAMERA` + `RECORD_AUDIO` in `AndroidManifest.xml` (Android).
- [ ] **Runtime** permission granted on Android (`PermissionsAndroid`) *before*
      mounting the session.
- [ ] `mediaPermissions` prop left at its default `true` (don't set it `false`
      for video flows).
- [ ] Testing on a **real device** — the iOS Simulator has no camera and
      `getUserMedia` fails there.

See [Platform setup](platform-setup.md) for the exact config.

## Assisted video call drops, freezes, or shows no remote video

Assisted uses WebRTC (OpenTok/Vonage), which is the most WebView-sensitive path.

- Switch to **in-app browser mode** (`openIdviaSession({ mode: 'in-app-browser' })`)
  — it uses the system browser engine and is the most compatible.
- Confirm the device is on a stable network; WebRTC needs decent bandwidth and
  may be blocked by restrictive corporate/VPN networks.
- On Android, ensure hardware acceleration is enabled (it is by default; don't
  disable it globally).

See [Guide: Assisted](guides/video-assisted.md#webview-vs-in-app-browser).

## Flow loads but loses its session / redirects to login mid-way

Cookies aren't persisting across redirects.

- iOS: `sharedCookiesEnabled` must be on (the SDK sets it; if you pass custom
  `webViewProps`, don't turn it off).
- Android: `thirdPartyCookiesEnabled` + `domStorageEnabled` must be on.

## `onSuccess` never fires

The SDK detects completion by matching navigation against `landingUrl` /
`landingKoUrl`. If it never fires:

- Confirm the `landingUrl` you pass the SDK is **exactly** the one your backend
  registered on the create call (scheme + host + path must match the prefix the
  SDK compares).
- Use `onNavigationEvent` to log every URL the WebView visits and see where the
  flow actually ends up.
- Some providers append query params to the landing URL — the SDK matches on
  prefix, so a trailing `?token=…` is fine, but a different path is not.

## `onError` with `WEBVIEW_UNSUPPORTED`

`react-native-webview` isn't installed or linked.

```bash
npm install react-native-webview
cd ios && pod install && cd ..   # iOS
```

Rebuild the app (a JS reload isn't enough after adding a native module).

## `onError` with `LOAD_FAILED`

- The session URL may have **expired** (`slaExpirationSeconds`) or already been
  used. Session URLs are one-time — create a fresh one per attempt.
- Check the device can reach the Idvia host (corporate proxies, ad
  blockers, VPNs can interfere).

## Result is `PENDING` right after the user finishes

Expected. For unassisted, the engine verdict (`EngineVerificationCompleted`) can
arrive a few seconds **after** the user reaches the landing page. Poll your
backend `results` endpoint (or subscribe) until it settles — see
[Handling results](handling-results.md).

## Expo Go: camera/permissions don't work

Expo Go can't grant custom native permissions. Use a **custom dev client**
(`npx expo run:ios` / `run:android`, or an EAS dev build) and add the permissions
via `app.json` as shown in [Platform setup](platform-setup.md).

## iOS build fails with `Sandbox: bash(...) deny(1) file-write-data ... ip.txt`

Xcode 15+ enables **User Script Sandboxing** on new projects, which blocks the
"Bundle React Native code and images" build phase from writing into the `.app`
(`xcodebuild` exits with code 65). Set `ENABLE_USER_SCRIPT_SANDBOXING` to `NO`
for the target and the project — in Xcode (**Build Settings → User Script
Sandboxing → No**) or directly:

```bash
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' ios/<YourApp>.xcodeproj/project.pbxproj
```

Expo regenerates `ios/` on `npx expo prebuild --clean`, so reapply it (or keep it
in a config plugin) after a clean prebuild.
