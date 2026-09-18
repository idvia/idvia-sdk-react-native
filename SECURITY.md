# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems. Report them to
**cybersecurity@idvia.com** with a description, affected version and, if possible,
steps to reproduce. We acknowledge reports within 3 business days.

## Supported versions

Only the latest minor version published on npm receives security fixes.

## What the SDK does and does not protect

- The SDK fences WebView navigation and camera/microphone grants to Idvia
  hosts (`allowedHosts`, `mediaPermissions`). Keep those props at their
  defaults unless you know why you are changing them.
- Session creation must happen on your backend. `IdviaClient` exists for
  pilots only: a `client_secret` embedded in a mobile app must be considered
  public. See `docs/backend-session-creation.md`.
- The client-side outcome (landing URL) is a UX signal. Always confirm results
  server-side through the status endpoints or webhooks.
