# JARVIS Web App

This branch adds a responsive browser-first JARVIS experience in `webapp/`. It is designed for iPhone Safari, Android browsers, tablets, and desktop browsers. It is a separate web client; the existing Flutter/Android app is not modified.

## Included

- Responsive assistant workspace and conversation history
- Browser speech recognition where supported (microphone permission required)
- Installable PWA manifest and service worker
- Server-side OpenAI chat endpoint; the provider key is never sent to the browser
- Vercel static hosting configuration

## Deploy a preview with Vercel

1. Import `markwylie40/Jarvis` into Vercel and select the `webapp-port` branch.
2. Keep the project root set to the repository root. `vercel.json` serves the `webapp/` directory and exposes `api/chat.js`.
3. In Project Settings → Environment Variables, add `OPENAI_API_KEY` (server-side only). Optionally add `JARVIS_MODEL` to choose a model available to your API account; the default is `gpt-4o-mini`.
4. Deploy a Preview first. Do not put the API key in a `NEXT_PUBLIC_*` variable or in any file under `webapp/`.

The API endpoint returns a setup message until `OPENAI_API_KEY` is configured. Never commit secrets.

## Local preview

Serve `webapp/` as static files and run the API function in a Vercel-compatible local environment (for example, `vercel dev`). A static file server alone can preview the interface but cannot answer AI requests.

## iPhone installation

Open the deployed HTTPS URL in Safari → Share → Add to Home Screen. On Android, use the browser's Install app / Add to Home screen option. HTTPS is required for service workers, microphone access, and PWA features.

## Browser limitations

The web app cannot create an Android-style overlay above other apps, run a persistent wake word in the background, inspect other apps, or perform unrestricted device automation. Speech recognition support varies by browser; text chat remains available everywhere.

## Security notes

The API validates request shape and size, limits conversation context, and keeps the provider key server-side. Before public production use, add authenticated user accounts, per-user rate limiting/quotas, abuse monitoring, and an explicit data-retention policy. Conversation history currently stays in the browser's local storage on that device.
