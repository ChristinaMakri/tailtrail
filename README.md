# TailTrail 🐾

**AI-powered lost & found pet app for Greece**

Open source mobile application that uses AI photo matching to help reunite lost pets with their owners.

## Features

- 📸 Upload a photo of a found animal → AI matches against lost pet reports
- 🔍 Upload a photo of your lost pet → AI matches against found animal reports
- 📍 Location-aware matching (configurable radius, default 30km)
- 🤖 CLIP AI visual similarity — no keyword search needed
- 🔔 Push notifications when a match is found
- 🛡️ Approximate location only — no exact address shown
- ✅ Auto image moderation + report button

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo (SDK 56) |
| Backend | Supabase (PostgreSQL + pgvector + PostGIS) |
| AI Matching | CLIP model via HuggingFace Inference API |
| Auth | Supabase Auth (email + Google + Apple) |
| Storage | Supabase Storage |
| Notifications | Expo Push Notifications |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- HuggingFace account (free tier)

### 1. Clone & install

```bash
git clone https://github.com/ChristinaMakri/tailtrail.git
cd tailtrail/app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run migrations in the SQL editor: `supabase/migrations/001_initial.sql` then `002_find_similar_pets.sql`
3. Enable **Google** and **Apple** OAuth providers in Authentication → Providers
4. Deploy Edge Functions: `supabase functions deploy generate-embedding find-matches moderate-image`
5. Set secrets: `supabase secrets set HUGGINGFACE_TOKEN=your_hf_token`

### 3. Configure

Update `app/app.json` → `extra` with your Supabase URL and anon key.

### 4. Run

```bash
cd app
npm start
```

## Project Structure

```
tailtrail/
├── app/                    # React Native + Expo
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # React Navigation setup
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Supabase client + design system
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Helper functions
│   └── App.tsx
└── supabase/
    ├── migrations/         # Database schema (PostgreSQL)
    └── functions/          # Edge Functions (Deno)
        ├── generate-embedding/   # CLIP AI via HuggingFace
        ├── find-matches/         # Vector similarity + PostGIS
        └── moderate-image/       # Auto content moderation
```

## License

MIT — free to use, modify, and distribute.
