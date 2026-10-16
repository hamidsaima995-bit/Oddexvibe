# OddexVibe

A satirical, entertainment-only trading simulator built with React. Players trade on fictional markets with live candlestick charts, an AI news commentator, community chat, trading streaks, and a referral system. Nothing here is real money or real financial advice. It is a game.

Live site: https://oddexvibe.com

## Tech

- React with Vite
- Supabase for data and auth
- Deployed on Railway

## Project layout

- `src/`, the React app
- `public/`, static assets
- `src/supabase.js`, the Supabase connection (uses a publishable key, which is safe in client code because the database is protected by row-level security)
- `vite.config.js`, build config
- `railway.json`, Railway deploy config

## Running it locally

You need Node.js installed.

```
npm install
npm run dev
```

This starts the Vite dev server. To build for production:

```
npm run build
npm run preview
```

## Notes

The Supabase URL and publishable key live in `src/supabase.js`. The real security is enforced by row-level security policies on the database, so the publishable key being visible is expected and fine.

## Author

Saima Hamid, Ninja Tech, Lahore. https://ninjatechdev.com
