# Platform setup

The **video flows** (Unassisted and Assisted) run `getUserMedia` inside the
WebView to access the camera and microphone. Without the native permissions and
WebView flags below, the user sees a **black camera view** or a permission error.

The **Sign** flow needs none of this — skip to the bottom if you only sign.

---

## iOS

### 1. Usage descriptions (`Info.plist`)

iOS rejects camera/mic access without a usage string. Add both, even if a flow
only uses the camera — the video call needs the mic too.

```xml
<key>NSCameraUsageDescription</key>
<string>We use the camera to verify your identity.</string>
<key>NSMicrophoneUsageDescription</key>
<string>We use the microphone for identity video calls.</string>
```

Expo — add to `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "We use the camera to verify your identity.",
        "NSMicrophoneUsageDescription": "We use the microphone for identity video calls."
      }
    }
  }
}
```

### 2. WebView media flags

The SDK sets these automatically when you use `<IdviaSession>`, but if you
build your own WebView, you need:

- `allowsInlineMediaPlayback={true}` — otherwise the camera opens full-screen and breaks the flow.
- `mediaPlaybackRequiresUserAction={false}` — lets the flow start the camera.
- `mediaCapturePermissionGrantType="grant"` — auto-grants `getUserMedia` (still gated by the OS permission prompt).

> **Camera does not work in the iOS Simulator.** Test video flows on a real device.

---

## Android

### 1. Permissions (`AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

Expo — add to `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": ["CAMERA", "RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS"]
    }
  }
}
```

### 2. Runtime permission request

Android also requires **runtime** consent. Request it before showing a video
flow:

```ts
import { PermissionsAndroid, Platform } from 'react-native';

export async function ensureMediaPermissions() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
  return (
    granted['android.permission.CAMERA'] === 'granted' &&
    granted['android.permission.RECORD_AUDIO'] === 'granted'
  );
}
```

### 3. WebView `onPermissionRequest`

The WebView must grant the web page's camera/mic request. `<IdviaSession>`
handles this internally. If you build your own WebView, grant the request in
`onPermissionRequest` and enable `domStorageEnabled`, `javaScriptEnabled`, and
`thirdPartyCookiesEnabled`.

---

## Cookies & sessions

Idvia flows keep server state in cookies across redirects. The SDK enables:

- iOS: `sharedCookiesEnabled={true}`
- Android: `thirdPartyCookiesEnabled={true}` + DOM storage

If you subclass the WebView, keep these on, or the flow will lose its session
mid-way.

---

## Sign-only apps

If you only use the Sign flow, none of the above is required. Sign renders a
document and a signature pad — no camera, no microphone. Just install the package
and its `react-native-webview` peer dependency.
