# YouTube Studio Simulator – *The Past Explained*

An interactive, locally-run simulation of the YouTube Studio interface for a **fictional**
fast-growing history channel, **The Past Explained** (AI-assisted documentaries about empires,
wars, mysteries and forgotten history).

> **Disclaimer:** everything here is simulated. The channel, its videos, comments, subscribers
> and every statistic are fictional and generated locally. Nothing connects to YouTube or Google,
> and the numbers are not real analytics. This project is not affiliated with or endorsed by YouTube.

## Running it

```bash
cd youtube-studio-simulator
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/ (static, works from any folder)
npm run preview    # serve the production build
```

Requires Node 18+. The app uses hash routing and relative asset paths, so `dist/` can be opened
from any static host.

## Channel numbers (last 28 days)

The analytics engine (`src/data/analytics.ts`) is calibrated so the latest 28-day period
reproduces these figures exactly, and every per-video number sums back to the channel totals:

| Metric | Value |
|---|---:|
| Subscribers | 84,650 (+12,650) |
| Views | 1,284,650 |
| Watch time | 146,820 hours |
| Estimated revenue | £3,247.82 |
| RPM | £2.53 |
| Impressions | 9.8M |
| Impressions CTR | 6.8% |
| Average view duration (videos) | 8:42 |
| Published videos | 47 long-form (+14 Shorts, 1 scheduled premiere, 1 draft) |

To keep views, watch time and 8:42 AVD consistent, about 23% of views come from Shorts (≈36s
AVD). The long-form videos average 8:42, and the channel-wide average is lower because of the
Shorts.

The timeline is anchored to **today**: the channel launched ~300 days ago, so the dashboard always
looks current. Growth runs through ten monthly periods (the latest is the last 28 days), with
subscribers going 1.2K → 2.8K → 5.6K → 11.5K → 22K → 35K → 48K → 61K → 72K → 84.65K and revenue
going £0 → £0 → £0 → £120 → £420 → £890 → £1,450 → £2,100 → £2,650 → £3,247.82. Monetisation
starts in the fourth month.

## What's inside

| Section | Highlights |
|---|---|
| **Dashboard** | Latest video performance (ranking vs. last 10 uploads), channel analytics, live realtime card (ticking subscriber count + 48-hour bars), monetisation snapshot, latest comments, recent subscribers, recent activity, *Ideas for you* inspiration carousel, news |
| **Content** | Videos / Shorts / Live / Posts / Playlists / Podcasts / Promotions tabs; filter chips (title, description, visibility, monetisation, restrictions, views, made for kids), sorting, pagination, bulk edit, inline visibility and monetisation editors, delete with undo, community post composer with polls, playlist manager |
| **Video pages** | Details editor (title, description, thumbnail variants or your own uploaded image, playlists, audience, age restriction, altered-content disclosure, tags, category, comments), video analytics (Overview / Reach / Engagement / Audience / Revenue with retention curve), editor timeline (trim, blur, audio), comments, subtitles, copyright, monetisation (ad breaks, human review), clips |
| **Analytics** | Overview, Content, Audience, Revenue and Trends tabs; date ranges for the last 7/28/90/365 days, lifetime, the current year, the last three months and a custom range; comparison with the previous period; upload markers on charts; channel-growth journey; **Advanced mode** with a multi-video chart, sortable table and CSV export |
| **Community** | Published / Held for review / Likely spam; search, sort, filters (questions, unanswered, subscribers, per video); reply, like/dislike, heart, pin, remove, report, hide user, approve, bulk moderation; mentions |
| **Subtitles** | Per-video languages, add a language, caption editor (type manually, auto-sync or import an `.srt`/`.vtt` file), publish or save drafts |
| **Copyright** | Content ID claim (trim / replace song / mute / dispute), Copyright Match Tool matches (request removal, message the channel, archive), removal requests, messages, archive |
| **Earn** | YouTube Partner Programme status, revenue overview, payments, watch-page and Shorts ads, ad formats, memberships (three levels), Supers, Shopping |
| **Customisation** | Banner, picture, name, handle, description, links, contact email, watermark, home-tab spotlight and sections, plus a channel page preview |
| **Audio Library** | Free music and sound effects with filters and starring; tracks are synthesised in the browser with the Web Audio API, so **play** and **download** (WAV preview) both work |
| **Settings** | General, Channel, Upload defaults (used by the upload wizard), Permissions, Community filters and Agreements, plus *Reset simulator* |
| **Send feedback** | Side drawer with feedback history |
| **Header** | Channel-wide search, Create menu (upload wizard → Details / Video elements / Checks / Visibility, Go live, post, playlist, podcast), notifications, account menu |

All edits (titles, visibility, monetisation, comments, settings, uploads, profile, toggles and
more) are saved to `localStorage`. Use **Settings → General → Reset simulator to defaults** to
start over.

## Project structure

```
src/
  data/          seeded, deterministic data (kept separate from the UI)
    catalogue.ts   47 documentaries + 14 Shorts + unpublished items (titles, thumbnails, appeal…)
    analytics.ts   calibrated daily analytics engine + query helpers
    audience.ts    demographics, geography, traffic sources, research topics
    comments.ts    seeded comments (published / held / spam)
    channel.ts     profile, playlists, posts, notifications, subscribers, inspiration
    library.ts     audio library, copyright matches/claims, subtitles
  store/         StudioContext – app state with localStorage persistence
  lib/           formatting, date ranges, metrics, realtime ticker, synth, helpers
  components/    layout (header/sidebar), common UI, charts, thumbnails, analytics widgets
  pages/         one folder or file per Studio section
```

Thumbnails are drawn as SVG at runtime (`components/thumbnails`), so there are no image files to
break. To add a video, add an entry to `LONG_FORM` in `src/data/catalogue.ts`. The engine slots
it into the schedule and recalibrates the totals.

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide icons, React Router (hash
routing).
