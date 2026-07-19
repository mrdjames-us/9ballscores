# APA 9-Ball Scorer (`9ballscores.jamesnetworks.net`)

Mobile-friendly **APA 9-Ball Equalizer®** scorer — points, defenses, 9-on-the-snap / break-and-run, match points (20-point chart), player profiles, and local history.

Copy of the local scorer in `C:\Users\mrdja\apa9ball` (single-page app; all data stays in the browser via `localStorage`).

## Live

| Item | Value |
|------|--------|
| **Custom domain** | https://9ballscores.jamesnetworks.net |
| **Pages URL** | https://9ballscores.pages.dev |
| **Repo** | `mrdjames-us/9ballscores` |
| **Stack** | Static HTML (no build step) |
| **Host** | Cloudflare Pages · project `9ballscores` |

## Local preview

```bash
npx --yes serve .
```

Or open `index.html` directly in a browser.

## Deploy (Cloudflare Pages)

| Item | Value |
|------|--------|
| **Project** | `9ballscores` |
| **Git** | `mrdjames-us/9ballscores` → branch `main` |
| **Build** | empty · output: `/` (static) |
| **Pages URL** | https://9ballscores.pages.dev |
| **Custom domain** | `9ballscores.jamesnetworks.net` |

### Direct upload (break-glass)

```bash
# Non-interactive: set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID first
wrangler pages deploy . --project-name=9ballscores --branch=main
```

### Squarespace DNS (zone is on Squarespace)

| Host | Type | Data |
|------|------|------|
| `9ballscores` | **CNAME** | `9ballscores.pages.dev` |

SSL is automatic once Cloudflare Pages sees the CNAME (same pattern as `apacaptain.jamesnetworks.net` and `www.jamesnetworks.net`).

## Features (app)

- Score matches under APA 9-Ball Equalizer points (SL 1–9 goals)
- Tap-to-pocket ball rack UI (1–8 = 1 pt, 9 = 2 pts)
- Miss / Defense / Foul / Dead ball / Undo
- 9 on the Snap and Break & Run tracking
- Score of Match (20-point) chart at match end
- Saved players, career stats, match history (export JSON)
- **Cloud scorebook** (Cloudflare D1) — shared sync code across devices
- Built-in rules summary + charts

## Cloud storage (history + players)

| Item | Value |
|------|--------|
| **Store** | Cloudflare **D1** database `9ballscores` |
| **API** | Pages Functions: `POST /api/book`, `GET|PUT /api/book/:code` |
| **Model** | One “scorebook” per 8-char code (e.g. `ABCD-2345`) |
| **Local cache** | Still uses `localStorage` for offline + speed |
| **Sync** | Create/link code under **History → Cloud Scorebook**; auto-pushes after matches |

The code **is** the secret — anyone with it can read/write that book. Don’t post it publicly.

## Source

Original working file: `C:\Users\mrdja\apa9ball\index.html`
