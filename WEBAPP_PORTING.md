# J.A.R.V.I.S. Web App / PWA Port

## Product direction

J.A.R.V.I.S. is being moved from an Android-first Flutter application to a browser-based web app, optimized for Safari on iPhone and installable as a Progressive Web App (PWA). No Mac, Xcode, App Store submission, or native iOS binary is required for users.

## Recommended implementation

Keep Flutter/Dart as the first implementation path to preserve the existing screens, theme, AI clients, conversation logic, and service code where it is platform-independent. Enable Flutter web and add a PWA manifest, icons, service worker/offline shell, responsive layout, and browser-specific service adapters. Do not try to compile Android native code into the web app.

If web compatibility of the existing Flutter UI proves too costly, migrate the presentation to a TypeScript web frontend while retaining the existing backend/API contracts. Avoid rewriting working AI logic without a demonstrated need.

## Existing code findings

- `lib/app.dart` already provides the app root, onboarding routing, theme, and home screen.
- `lib/main.dart` initializes multiple services and unconditionally imports/initializes `flutter_overlay_window`; this must be removed from the web startup path.
- `lib/services/jarvis_service.dart` imports `flutter_overlay_window` and broadcasts overlay state. Those calls need a conditional web adapter/no-op, or a web-specific controller.
- `lib/overlay/overlay_app.dart` is an Android floating overlay and should not be part of the web experience. Recreate its useful controls as an in-page responsive panel.
- `pubspec.yaml` includes Android-oriented plugins: `installed_apps`, `android_intent_plus`, `shizuku_api`, and `flutter_overlay_window`. Audit all plugin web implementations before enabling web compilation.
- Android-only MethodChannels and `MainActivity.kt` functionality cannot run in a browser.

## Web feature mapping

| Existing feature | Browser/PWA implementation |
|---|---|
| AI chat, reasoning, provider integrations | Reuse Dart clients where web-safe; route secret-bearing requests through a backend |
| HUD and chat UI | Reuse Flutter UI and make responsive for phone/desktop |
| Voice input | Browser Web Speech API where supported; explicit tap-to-talk fallback |
| Spoken responses | Browser speechSynthesis |
| Camera visual AI | getUserMedia with explicit permission and foreground use |
| Notes, tasks, preferences | IndexedDB/local storage; optional authenticated cloud sync |
| Notifications | Web Push with user permission and a server push service; support varies by browser |
| Calendar / contacts | User-mediated file/import, share, or supported browser integrations; no unrestricted device database access |
| Open other apps | User-initiated links / share sheet; no arbitrary app control |
| Screen reading / tapping other apps | Not available to ordinary web apps |
| Floating overlay | In-page HUD only; browsers do not permit drawing over other apps |
| Always-on wake word | Not reliably available in background on iPhone Safari; use tap-to-talk |
| Android sensor / system settings / SMS access | Not available through standard browser APIs |

## Security requirements

- Never ship provider API keys or bot tokens in browser JavaScript or Flutter web assets.
- Add authenticated server endpoints for AI provider calls and any integrations that contain secrets.
- Validate inputs, rate-limit requests, and scope each user's stored data.
- Use HTTPS for microphone, camera, and service worker functionality.
- Do not store sensitive credentials in localStorage.

## Delivery plan

1. Add Flutter web support and a web-only entry point that avoids Android overlay/native initialization.
2. Audit every imported plugin and platform channel reachable from the web entry point; add conditional imports/adapters.
3. Make the home/chat experience responsive and replace the floating overlay with an in-page HUD.
4. Add PWA manifest, app icons, theme colors, and service worker/offline app shell.
5. Move secrets and provider calls behind a backend; add authentication before multi-user deployment.
6. Run Flutter web build and browser tests in CI, then deploy to HTTPS hosting.
7. Test installability and microphone/camera permissions on iPhone Safari.

## Branch strategy

Work is isolated on `webapp-port`. The Android `master` branch is left unchanged.
