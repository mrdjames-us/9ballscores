# Firebase (Phase 1) — shared with APA Captain

Scorers reuse the **apa-coach** Firebase project (same Google sign-in as APA Captain).

## Config

Client config is embedded in `index.html` (same values as APA Captain `VITE_FIREBASE_*`).

## Firestore paths

| Path | Contents |
|------|----------|
| `users/{uid}/scorebooks/nineball` | `{ profiles, history, updatedAt }` |
| `users/{uid}/scorebooks/eightball` | same shape |

## Deploy rules

From `APA Captain` (or any folder with `firebase.json` pointing at `apa-coach`):

```bash
firebase deploy --only firestore:rules --project apa-coach
```

Rules source of truth: `APA Captain/firestore.rules` (and copy in this folder for scorers).

## Authorized domains (Firebase Console → Authentication → Settings)

Add each host you use:

- `localhost`
- `9ballscores.pages.dev`
- `9ballscores.jamesnetworks.net`
- `8ballscores.pages.dev`
- `8ballscores.jamesnetworks.net`
- `apacaptain.jamesnetworks.net` (already)
- `www.jamesnetworks.net` / hub hosts when Phase 0 lands

Without these, Google popup fails with `auth/unauthorized-domain`.

## Local vs Google vs sync code

| Mode | Use |
|------|-----|
| localStorage | Always (offline cache) |
| Google account | Personal history across devices |
| D1 sync code | Shared bar book (no login) |
