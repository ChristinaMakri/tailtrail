# TailTrail 🐾

**Δωρεάν, ανοιχτού κώδικα εφαρμογή εύρεσης χαμένων ζώων συντροφιάς στην Ελλάδα**

Ανέβασε φωτογραφία και η AI θα βρει το ζωάκι σου — χωρίς χρέωση, χωρίς διαφημίσεις.

<p align="center">
  <img src="app/assets/screenshots/01_welcome.png" width="18%" alt="Αρχική" />
  <img src="app/assets/screenshots/02_home.png" width="18%" alt="Feed" />
  <img src="app/assets/screenshots/03_report_choice.png" width="18%" alt="Νέα αγγελία" />
  <img src="app/assets/screenshots/04_matches.png" width="18%" alt="AI Ταιριάσματα" />
  <img src="app/assets/screenshots/05_profile.png" width="18%" alt="Προφίλ" />
</p>

---

## Πώς λειτουργεί

1. **Έχασες ζωάκι;** Ανέβασε φωτογραφία → η AI αναζητά αντιστοιχίσεις με βρεθέντα ζώα στην περιοχή σου
2. **Βρήκες ζωάκι;** Ανέβασε φωτογραφία → η AI ψάχνει μεταξύ χαμένων ζώων κοντά σου
3. **Λαμβάνεις ειδοποίηση** όταν βρεθεί πιθανό ταίριασμα — εσύ επιβεβαιώνεις

Το σύστημα χρησιμοποιεί το μοντέλο **CLIP** για οπτική ομοιότητα φωτογραφιών και **PostGIS** για γεωγραφική αναζήτηση εντός ρυθμιζόμενης ακτίνας (10 / 30 / 50 / 100 χλμ).

## Χαρακτηριστικά

- **AI photo matching** — CLIP visual embeddings, χωρίς ανάγκη για περιγραφή κειμένου
- **Γεωγραφική αναζήτηση** — ρυθμιζόμενη ακτίνα, προεπιλογή 30 χλμ
- **Προστασία τοποθεσίας** — εμφανίζεται μόνο κατά προσέγγιση περιοχή, όχι ακριβής διεύθυνση
- **Αυτόματο moderation** φωτογραφιών + κουμπί αναφοράς
- **Push notifications** για κάθε νέο ταίριασμα
- **Σύνδεση με Google / Apple**
- **GDPR compliant** — αυτόματη διαγραφή δεδομένων 7 ημέρες μετά το κλείσιμο αγγελίας
- **100% δωρεάν** για χρήστες και για hosting (Supabase free tier + HuggingFace free API)

## Tech Stack

| Layer | Τεχνολογία |
|---|---|
| Mobile | React Native + Expo SDK 56 (TypeScript) |
| Backend | Supabase (PostgreSQL + pgvector + PostGIS) |
| AI Matching | CLIP `openai/clip-vit-base-patch16-224` via HuggingFace |
| Auth | Supabase Auth — email / Google / Apple OAuth |
| Storage | Supabase Storage |
| Serverless | Supabase Edge Functions (Deno) |
| Notifications | Expo Push Notifications |

## Ξεκινώντας

### Προαπαιτούμενα

- Node.js 18+
- Λογαριασμός [Supabase](https://supabase.com) (free tier)
- Λογαριασμός [HuggingFace](https://huggingface.co) (free tier)

### 1. Clone & εγκατάσταση

```bash
git clone https://github.com/ChristinaMakri/tailtrail.git
cd tailtrail/app
npm install
```

### 2. Supabase — βάση δεδομένων

1. Δημιούργησε νέο project στο [supabase.com](https://supabase.com)
2. Στο **SQL Editor** τρέξε διαδοχικά:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_find_similar_pets.sql`
3. Ενεργοποίησε **Google** και **Apple** OAuth στο Authentication → Providers

### 3. Supabase — Edge Functions

```bash
supabase functions deploy generate-embedding find-matches moderate-image
supabase secrets set HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxx
```

### 4. Ρύθμιση

Στο `app/app.json` → `extra` βάλε το Supabase URL και το anon key του project σου:

```json
"extra": {
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseAnonKey": "your-anon-key"
}
```

### 5. Εκτέλεση

```bash
cd app
npm start
```

Σάρωσε το QR code με το [Expo Go](https://expo.dev/go) (Android / iOS).

## Δομή project

```
tailtrail/
├── app/                          # React Native + Expo
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/             # Welcome, Login, Register
│   │   │   ├── home/             # Feed + λεπτομέρεια αγγελίας
│   │   │   ├── report/           # Νέα αγγελία (χάθηκε / βρέθηκε)
│   │   │   ├── matches/          # AI ταιριάσματα
│   │   │   └── profile/          # Προφίλ + αγγελίες μου
│   │   ├── components/           # Επαναχρησιμοποιούμενα UI components
│   │   ├── navigation/           # React Navigation (stack + tabs)
│   │   ├── hooks/                # useAuth, usePets, useMatches
│   │   ├── lib/                  # Supabase client + design system
│   │   └── types/                # TypeScript interfaces
│   └── App.tsx
└── supabase/
    ├── migrations/
    │   ├── 001_initial.sql        # Πίνακες, RLS, triggers
    │   └── 002_find_similar_pets.sql  # pgvector similarity function
    └── functions/
        ├── generate-embedding/    # CLIP embedding via HuggingFace
        ├── find-matches/          # Vector + PostGIS αναζήτηση
        └── moderate-image/        # Αυτόματο content moderation
```

## Άδεια χρήσης

MIT — ελεύθερο για χρήση, τροποποίηση και διανομή.
