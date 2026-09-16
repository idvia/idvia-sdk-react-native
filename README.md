# @idvia/react-native-sdk

React Native SDK for Idvia **VideoID Unassisted**, **VideoID
Assisted**, and **Sign** flows: an API client plus a managed-WebView rendering
layer.

This repository contains everything an integrator needs:

| Path | What it is |
|------|------------|
| [`docs/`](docs/index.md) | Integrator documentation. Start with the [overview](docs/index.md), then [getting started](docs/getting-started.md). |
| [`example/`](example/README.md) | Runnable Expo dev-client app exercising all three flows against the real APIs. |
| `lib/` | The compiled SDK (CommonJS + ES modules + TypeScript declarations). This is the package the example app — and your app — consumes. |

The SDK source code lives in a separate (private) repository; `lib/` here is
its build output, published together with the docs and example.

## Installing the SDK in your app

The package is not on the public npm registry. Install it straight from this
repository:

```bash
npm install <path-or-git-url-of-this-repo>
```

plus the required peer dependency:

```bash
npm install react-native-webview
```

`expo-web-browser` / `react-native-inappbrowser-reborn` are optional peers,
only needed for the in-app-browser presentation mode — see
[platform setup](docs/platform-setup.md).

## Running the example app

```bash
cd example
npm install
cp config.example.ts config.ts   # then edit config.ts with your real credentials
npx expo run:android             # or: npx expo run:ios
```

A real device is required for the video flows (no camera in emulators). Full
instructions, including WebView debugging, are in
[`example/README.md`](example/README.md).
