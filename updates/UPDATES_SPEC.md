# Auto-Update System — Spec

Repo: `marcusdhaynes/Pheme` · App: Pheme · Current version (at rollout): `0.0.0` (no package.json in this repo — current version unknown, recorded as 0.0.0 placeholder)
Category: **A** — Settings menu exists — implemented LIVE (ribbon + Updates section at the bottom of Settings).

## Flow (identical in every app)

1. The app checks `https://api.github.com/repos/marcusdhaynes/Pheme/releases/latest`.
2. The release tag (semver `vX.Y.Z`) is compared with the app's current version.
3. If a newer version exists:
   - **Ribbon:** a thin ribbon at the **top center** of the app, very low height — just
     enough for short text like `Update available · vX.Y.Z`. It is styled **neutrally /
     theme-aware** so it does not clash with the app's own theme. The ribbon itself is
     the button: **clicking it executes the update**. The **X** on its right dismisses it
     **permanently for that version** (stored in local storage; it does not come back on
     the next launch). Full update information remains in Settings (below).
   - **Settings → Updates section:** permanently at the **very bottom of Settings**,
     showing current version, available version, **What's New** (release notes),
     a **Check for updates** button, and an **Update** button. It stays there until updated.
4. On **Update**: download, close the current version, install/swap, and reopen.
   Web apps simply refresh to the newly deployed version. APK/native builds still
   require the platform install tap (e.g. Android's install prompt).

## Release format

- Proper **GitHub Releases** — commits alone are not enough.
- Tag: semver `vX.Y.Z`; release notes become the **What's New** text.
- Attach the installable assets for the platform (web deploy / APK / desktop build).

## Future-proof rule

- If this app **already has a Settings menu**, the Updates section is implemented
  **live now**, at the bottom of Settings, and the ribbon is wired in the app root.
- If this app has **no Settings menu anywhere**, this code is present
  **prepared / dormant only** — it is not imported or displayed anywhere and makes
  **no visible UI change**. When a Settings menu is added later, the Updates section
  is implemented at the **bottom of that Settings menu** at that time (Marcus will
  ask Muse to wire it if a future Settings menu does not pick it up automatically).

## This repo

Classification: Category A. Evidence: `index.html` has a Settings panel — `<aside class="settings-panel" id="settings-panel">` with `<h2>Settings</h2>` ("PERSONALIZE YOUR EDITION"), opened by the `#settings-toggle` gear button; `app.js` implements `toggleSettings()` for it.

Live wiring (minimal, in `index.html` only): an `<div id="updates-section">` placeholder at the very bottom of `#settings-panel`, plus `<link>`/`<script>` tags for `updates/updates.css` / `updates/updates.js`. The script renders the Updates section into that placeholder and shows the top-center ribbon when a newer release exists. No `package.json` exists in this repo, so the current version is unknown; `0.0.0` is a placeholder.
