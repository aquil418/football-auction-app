# Football Auction — Shared Online Mode

This build keeps the existing Expo app but moves the auction state to Supabase Realtime so every connected device sees the same auction. Player-card images are uploaded to Supabase Storage instead of remaining as local phone/browser URIs.

## Free architecture

- **App:** Expo Router + React Native Web
- **Backend:** Supabase Free
- **Realtime:** Supabase Realtime (free tier supports 200 concurrent connections)
- **Player images:** Supabase Storage
- **Hosting:** Expo EAS Hosting free tier, using an `*.expo.app` URL — no paid domain required

## 1. Create Supabase project

Create a free project at https://supabase.com/dashboard.

Then open **SQL Editor**, paste everything from `supabase-schema.sql`, and run it.

That creates:

- `auction_state` — one shared auction document
- Realtime replication for that table
- `player-images` public storage bucket
- Storage policies required by the app

## 2. Configure the app

Copy `.env.example` to `.env` and fill in the Project URL and anon/publishable key from Supabase. **Do not use a service-role key.**

```text
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

## 3. Test locally

```bash
npm install
npx expo start --web
```

Open the web app on two devices/browsers. Log in as Viewer on both. From the admin browser, change the auction state. Both viewers should update automatically.

## 4. Deploy without buying a domain

Expo EAS Hosting gives the project a free `*.expo.app` URL.

```bash
npm run deploy:web
```

The first deployment asks you to log in to Expo and choose the app's subdomain. You can then give that URL to everyone, or turn it into a QR code.

## Important MVP security note

The current project still uses the existing client-side Admin password and Manager PIN. The Supabase policies intentionally allow the app's anon client to read/write the shared auction document so the MVP can work without paid infrastructure or a custom server. This is suitable for the controlled event MVP, but it is **not** a secure production authorization model. Before a public launch, move admin writes behind authenticated Supabase users or a server-side function and add proper row-level security.
