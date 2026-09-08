# คลังลวดลายไทย · Lai Thai Archive

Mobile-first web app (Thai UI) for documenting Thai ornamental patterns found in the field:
photograph a pattern → crop it → record where it came from → check it against similar patterns
already in the archive → have AI trace it into line art → adjust and export the line art → choose a
Creative Commons licence → submit it for review.

Built from the Claude Design handoff in `project/` (see [Design source](#design-source)).

- **Frontend + backend:** Next.js 16 (App Router) with TypeScript, React server components and server actions
- **Database, auth, storage:** Supabase (Postgres + RLS, email/password auth, three storage buckets)
- **AI line extraction:** Google Gemini image model
- **Maps:** Google Maps JavaScript API

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:3000
```

### 1. Supabase

Create a project, then run `supabase/migrations/0001_init.sql` (Supabase CLI: `supabase db push`,
or paste it into the SQL editor). It creates the tables, row-level security policies, the
`profiles` row trigger for new sign-ups, and the storage buckets:

| Bucket | Visibility | Holds |
| --- | --- | --- |
| `pattern-photos` | public | the original photographs |
| `line-art` | public | the AI-traced line art |
| `portraits` | private (signed URLs) | photographs of informants |

Copy the project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Gemini

Create a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and set
`GEMINI_API_KEY`. `GEMINI_IMAGE_MODEL` defaults to `gemini-2.5-flash-image`. Without a key the
AI step shows an error with a retry, and the rest of the flow still works.

### 3. Google Maps

Create a browser key with the Maps JavaScript API enabled and set
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Without a key the location step falls back to a placeholder map;
the GPS button uses the browser Geolocation API and works either way.

## How the app is laid out

```
src/app/(auth)/login|signup        sign in / sign up
src/app/(app)/capture              camera, shutter, upload sheet
src/app/(app)/record/*             the 13-step recording flow (see below)
src/app/(app)/gallery              คลังของฉัน — albums, album tiles, pending & draft lists
src/app/(app)/explore              สำรวจลวดลาย — search, filters, tabs
src/app/(app)/profile              contributor stats
src/app/(app)/pattern/[id]         shared pattern detail page
src/app/api/line-art               POST → Gemini → line art stored in Supabase
src/app/actions/patterns.ts        server actions: drafts, submit, save-to-album, ♥
```

The recording flow is `verify → source-type → place → object → pattern → informant → similar →
(compare) → ai → ai-result → edit-line → save-file → license → confirm`. Its in-progress state
lives in a Zustand store persisted to `sessionStorage` (`src/state/wizard.ts`), so steps can be
revisited from the confirm screen's แก้ไข links without losing anything; nothing is written to
Postgres until บันทึกฉบับร่าง, บันทึกลายเส้นนี้, or ยืนยันและบันทึก.

**Two ways to save** (as designed): บันทึกเป็นรายการใหม่ creates a new `patterns` row with status
`pending`, and อัพเดทข้อมูล files the contribution against an existing pattern as a
`pattern_updates` row — both go through the confirm screen first.

**Line art** is rendered client-side from the Gemini output (`src/lib/line-art.ts`): the strokes are
thresholded into a mask, thickened by the chosen weight, tinted with the chosen ink, and exported as
PNG, PDF (jsPDF), or a genuine vector SVG traced with Moore-neighbour boundary tracing and
Douglas–Peucker simplification.

## Review step — needs a decision

Submitted patterns land in `pending` and submitted edits in `pattern_updates`; **the archive
curator's review screens were not part of the design bundle**, so nothing in the app promotes a
pattern to `published` or merges an update. Until that is designed, publish from SQL:

```sql
update patterns set status = 'published', published_at = now() where id = '<pattern-id>';
```

Explore only lists `published` patterns, so a fresh project shows an empty archive until something
is published this way.

## Scripts

```bash
npm run dev         # dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

## Design source

`project/` holds the original Claude Design prototype (`Lai Thai Archive.dc.html` plus the
`support.js` runtime) and `chats/` the conversation it came from, including the two rounds of
written feedback that shaped the final screens. They are kept for reference — the app does not
depend on them.
