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

Add each host you use. **Demo will not sign in until the demo host is in this list.**

- `localhost`
- `9ballscores.pages.dev`
- `9ballscores.jamesnetworks.net`
- `9ballscores-demo.pages.dev`  ← required for demo Google login
- `8ballscores.pages.dev`
- `8ballscores.jamesnetworks.net`
- `8ballscores-demo.pages.dev`
- `apacaptain.jamesnetworks.net` (already)
- `www.jamesnetworks.net` / hub hosts when Phase 0 lands

Without these, Google popup fails with `auth/unauthorized-domain`.

Do **not** use `signInWithRedirect` on these Cloudflare Pages apps. Redirect to
`apa-coach.firebaseapp.com` dies on Safari/Chrome third-party storage. Popup only.

## History safety (Google link)

First Google sign-in on a phone that already has matches:

1. Snapshot local history to `apa9GoogleBackupV1` (never overwritten by a smaller copy).
2. Show a confirm modal: union merge, no deletes.
3. Write the union to localStorage, then to Firestore `users/{uid}/scorebooks/nineball` (or `nineball-demo`).
4. If the cloud write fails, local history stays. Restore backup is on the History tab.

Never replace local with an empty Google book. Shrink-guard aborts if a merge would drop matches.

Sign in **on the device that already has the matches** first. A brand-new phone with an empty Google account cannot invent history that still lives on the old phone.

## Local vs Google vs sync code

| Mode | Use |
|------|-----|
| localStorage | Always (offline cache) |
| Google account | Personal history across devices |
| D1 sync code | Shared bar book (no login) |
