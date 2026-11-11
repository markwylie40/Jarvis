# iOS Port Plan

This repository is currently a Flutter app with an Android-only native host. The iOS port should preserve the shared Dart UI and AI/provider logic while replacing Android platform integrations with iOS-native implementations.

## Current assessment

- Flutter/Dart application code is reusable where it does not depend on Android-only plugins or platform channels.
- There is no checked-in `ios/` directory in the current default branch.
- `lib/main.dart` imports and initializes `flutter_overlay_window` and wires an Android-style floating overlay at startup.
- `lib/services/native_bridge_service.dart` listens on `com.privateagent/accessibility`.
- The Android `MainActivity.kt` implements accessibility automation, continuous speech, camera capture, sensors, charging telemetry, storage, and network inspection.
- `pubspec.yaml` currently includes Android-oriented packages including `android_intent_plus`, `installed_apps`, `flutter_overlay_window`, and `shizuku_api`.

## Feature parity on iPhone

| Existing capability | iOS approach | Port status / constraint |
|---|---|---|
| Flutter HUD, chat, settings, AI provider clients | Reuse Flutter/Dart | Reusable after iOS compile fixes |
| Camera-based visual solver | Flutter camera plugin or AVFoundation bridge | Supported with foreground camera permission |
| Speech input | Speech framework / supported Flutter speech plugin | Foreground and user-initiated use |
| Spoken responses | AVSpeechSynthesizer or flutter_tts | Supported |
| AI providers and streaming | Reuse Dart HTTP/SSE clients | Reusable |
| Calendar and reminders | EventKit | Requires permission |
| Contacts | Contacts framework | Requires permission |
| Local notifications | UserNotifications | Supported with permission |
| Files | App sandbox, document picker, security-scoped URLs | Different from unrestricted Android storage |
| Smart home | Existing Home Assistant HTTP integration | Reusable; local-network permission may be required |
| Location / aircraft radar | Core Location + existing network services | Permission and background limits apply |
| Sentry motion detection | Core Motion while app is active | No guaranteed always-on sensor watchdog |
| Always-on wake word | User-started audio session / supported background audio use only | Cannot promise Android-style persistent wake-word service |
| Cross-app screen reading and touch automation | No public iOS equivalent to Android AccessibilityService | Not available to ordinary App Store apps |
| Floating overlay over other apps | No public iOS system-wide overlay API | Not available |
| Read SMS inbox / notification contents | No general public API | Not available |
| Silent background front-camera capture | AVFoundation only while app is active and permissioned | Not available as Android-style silent background capture |
| Change system volume/brightness, flashlight, arbitrary app launch | Public APIs, Shortcuts, URL schemes where available | Limited and user-mediated |

## Implementation sequence

1. Generate and check in the standard Flutter iOS host project (`ios/Runner`, Xcode project, Podfile, Flutter configs).
2. Make app startup and service initialization platform-aware so Android-only overlay and automation code is not invoked on iOS.
3. Add an iOS native bridge for the supported device features using Swift and documented Apple frameworks.
4. Replace Android-only package dependencies with cross-platform alternatives or conditional imports.
5. Add iOS permission purpose strings and capability configuration.
6. Run `flutter pub get`, `flutter analyze`, tests, and an iOS simulator/device build on macOS with Xcode.
7. Update onboarding and feature descriptions so unsupported Android-only functions are not presented as available on iPhone.

## Build requirements

An iOS simulator/device build and signing require macOS with a compatible Xcode installation. A valid Apple Developer signing setup is required for device distribution and App Store submission.

## Branch

Port work is isolated on the `ios-port` branch; the Android `master` branch remains unchanged.
