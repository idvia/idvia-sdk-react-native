# Running the example app on an iPhone (from a Mac)

A from-zero guide. You need: a Mac, an iPhone with its charging cable, an
Apple ID (a normal personal one is fine, no paid developer account needed),
and the Idvia credentials for `config.ts`.

All typed commands go into the **Terminal** app (find it with the magnifying
glass 🔍 in the menu bar: search "Terminal"). Type or paste each command and
press Enter. Wait for it to finish before the next one.

## Part 1 — Install the tools (one time only, ~1 hour, mostly waiting)

1. **Xcode.** Open the **App Store** on the Mac, search for **Xcode**, and
   install it. It is free and very large — start it first and let it download.
   When it finishes, open Xcode once: accept the license and let it "install
   components" when it asks (choose iOS if it asks which platforms). Then you
   can close it.

2. **Homebrew** (an installer for developer tools). In Terminal, paste:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   It will ask for your Mac login password (typing shows nothing — that's
   normal), then work for a few minutes. **Important:** when it finishes it
   prints a short "Next steps" section with one or two commands to paste —
   paste those too.

3. **Node and CocoaPods.** In Terminal:

   ```bash
   brew install node cocoapods
   ```

## Part 2 — Get the project

4. In Terminal:

   ```bash
   cd ~/Desktop
   git clone https://github.com/idvia/idvia-sdk-react-native.git
   cd idvia-sdk-react-native/example
   npm install
   ```

   This puts a folder called `idvia-sdk-react-native` on your Desktop and
   downloads the app's dependencies.

## Part 3 — Add the credentials

5. In Terminal (still in the `example` folder):

   ```bash
   cp config.example.ts config.ts
   open -e config.ts
   ```

   TextEdit opens the file. Replace the `YOUR_...` placeholders with the real
   values you were given (client id, client secret, use case ids). For the
   Sign flow, `signDocumentUrl` must point to a real, reachable PDF. Save and
   close. This file stays on your Mac only — it is never uploaded.

## Part 4 — Prepare the iPhone

6. Plug the iPhone into the Mac with the cable and unlock it. If it asks
   **"Trust This Computer?"**, tap **Trust** and enter the phone's passcode.

7. Turn on Developer Mode on the phone: **Settings → Privacy & Security →
   Developer Mode → on**, then let the phone restart and confirm. (If you
   don't see the Developer Mode entry yet, skip this — the phone will offer
   it after the first install attempt in Part 5, and you come back here.)

## Part 5 — Build and install (first time ~15 minutes)

8. In Terminal, from the `example` folder:

   ```bash
   npx expo run:ios --device
   ```

   Use the arrow keys to pick your iPhone from the list and press Enter. The
   first build is slow — let it run.

9. **If it stops with a signing/team error**, that's expected the first time.
   Fix it once in Xcode:
   - In the `example/ios` folder (it was just created), double-click the file
     ending in **`.xcworkspace`** — it opens in Xcode.
   - Xcode menu → **Settings → Accounts** → click **+** → **Apple Account** →
     sign in with your Apple ID. Close the settings window.
   - In the left sidebar, click the very top item (the blue project icon).
     Select the target under **TARGETS**, open the **Signing & Capabilities**
     tab, tick **Automatically manage signing**, and pick your name — it says
     **(Personal Team)** — under **Team**.
   - Back in Terminal, run the same command again:

     ```bash
     npx expo run:ios --device
     ```

10. **First launch may be blocked** with "Untrusted Developer". On the phone:
    **Settings → General → VPN & Device Management** → tap the developer
    entry with your Apple ID → **Trust**. Then open the app again.

## Part 6 — Use it

11. Keep the Terminal window open while you use the app — it runs the local
    server the app talks to. Phone and Mac must be on the **same Wi-Fi**.
12. In the app, tap a flow. Allow camera and microphone when the phone asks.
    The video flows need the real phone camera; the result screen shows the
    client outcome and can fetch the authoritative status afterwards.

## The day after / troubleshooting

- **Running it again later:** plug in the phone, then in Terminal:
  `cd ~/Desktop/idvia-sdk-react-native/example` and `npx expo run:ios --device`.
- **The app stopped opening after ~a week:** with a free Apple ID, installs
  expire after 7 days. Just run the command above again to reinstall.
- **"Untrusted Developer":** step 10.
- **The app opens but hangs on a white screen:** make sure the Terminal
  command is still running and both devices are on the same Wi-Fi, then close
  and reopen the app.
- **A flow fails immediately with an error screen:** usually a `config.ts`
  value — recheck the credentials and use case ids.
