# Monzi Mobile

Standalone Expo app to **list your Monzi agents** and **chat with them** from your phone.

- One ongoing chat per agent (no thread management)
- Uses the existing **Monzi web API** — no duplicate backend
- Clerk auth (same account as web)

## Prerequisites

- Node.js 20+
- Monzi web app running (`Monzi-2.1`) locally or deployed
- Clerk publishable key (same Clerk app as web)
- `@clerk/clerk-expo` v2 (works in **Expo Go** — no custom dev build required for auth)

## Quick start

### 1. Configure environment

```bash
cd D:\Monzi-ai\Monzi-Mobile
copy .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same as web `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| `EXPO_PUBLIC_API_URL` | Monzi web app URL (see table below) |

**API URL by target:**

| Target | URL |
|--------|-----|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical phone | `http://<your-pc-lan-ip>:3000` |
| Production | `https://your-monzi-domain.com` |

### 2. Start the web API

```bash
cd D:\Monzi-ai\Monzi-2.1
npm run dev
```

### 3. Start the mobile app

```bash
cd D:\Monzi-ai\Monzi-Mobile
npm start
```

**Important:** `npm start` uses **Expo Go** mode so the QR code opens in the Expo Go app on your phone.

- Install **Expo Go** from the App Store / Play Store
- Phone and PC must be on the **same Wi‑Fi**
- Scan the QR with the **Camera app (iOS)** or **Expo Go (Android)**

If the terminal says *"Using development build"*, stop the server (Ctrl+C) and run `npm start` again — or press **`s`** in the terminal to switch to Expo Go.

Press `w` to open in the browser instead.

For a custom dev build (optional): `npm run start:dev` or `npm run android:dev`

## Clerk dashboard

In your Clerk application:

1. Enable **Native applications** / Expo
2. Add redirect scheme: `monzimobile://` (matches `app.json` → `scheme`)
3. Enable the same sign-in methods as web (email, Google, etc.)

## API endpoints used

| Action | Endpoint |
|--------|----------|
| List agents | `GET /api/agents` |
| Agent detail | `GET /api/agents/{agentId}` |
| Load chat | `GET /api/chat/{agentId}/history` |
| Send message | `POST /api/chat/{agentId}` |

All requests send `Authorization: Bearer <clerk-session-token>`.

## Project structure

```
app/
  (auth)/sign-in.tsx     Clerk native auth
  (app)/index.tsx        Agent list
  (app)/chat/[agentId].tsx
components/              UI building blocks
hooks/use-agents.ts      React Query data hooks
lib/                     API client, types, config
```

## v1 scope

**Included:** sign in, agent list, text chat with streaming, one thread per agent

**Not included:** agent editor, settings, billing, integrations UI, voice calls, conversation history UI, workspace switcher

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **QR scan does nothing** | You scanned a *dev build* QR with Expo Go. Restart with `npm start` (uses `--go`) or press **`s`** in the terminal to switch to Expo Go, then scan again |
| `Missing EXPO_PUBLIC_*` | Copy `.env.example` → `.env` and restart Expo |
| Network request failed | Check `EXPO_PUBLIC_API_URL`; use LAN IP on physical devices (`http://192.168.x.x:3000`) |
| 401 Unauthorized | Sign out and sign in again; verify Clerk key matches web |
| Google sign-in fails | In Clerk Dashboard, add redirect URL `monzimobile://oauth-callback` |
| **Cannot find native module 'ClerkExpo'** | You were on `@clerk/expo` v3, which needs a dev build. This project uses `@clerk/clerk-expo` v2 for Expo Go. Run `npm install`, restart with `npx expo start --go -c` |

## Related

Web app: `../Monzi-2.1`
