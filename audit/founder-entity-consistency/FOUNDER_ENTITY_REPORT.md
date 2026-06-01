# Founder Entity Consistency Report — Identity Cleanup Pass

**Date:** 2026-05-28  
**Repository:** elisence-website (sparse checkout)  
**Commit message:** Unify founder identity signals across Elisence Online

## Locked canonical entity

| Field | Value |
|-------|-------|
| Name | `Saami Salami Asl` |
| URL | `https://elisence.com/saami-salami.html` |
| Image | `https://elisence.com/assets/saami-founder.jpeg` |

---

## Pre-edit audit — impacted file categories

Forbidden identity patterns found in:

- Root: `index.html`, `story.html`, `video.html`, `saami-bio.html`, `sami-profile.html`
- `saami/`: hub, bio, message, press-kit, timeline, youtube, articles, interviews, achievements, nested `saami/saami/*`
- `articles/`: keywords meta + author schema URLs pointing at `founder-saami.html`

**Excluded (per scope):** investor deck HTML, audit deck proofs, `pitch-system.html`, `deck-system.html`, `web-summit-board.html`

---

## Changes applied

### Forbidden terms removed (visible copy + metadata)

- `Sami Salami`, `Saami Salami` (without Asl), `Saami (Sami) Salami`, `Sami / Saami`
- `also written as`, `also known as`, `same person`, alias clarification links/text
- `appears online in several forms`, `name variations`, `search for his name online`
- JSON-LD `alternateName` arrays on founder Person blocks

Replaced with calm professional founder wording (governance, non-diagnostic technology, platform architecture).

### Schema / metadata

- Article `author` URLs: `founder-saami.html` → `https://elisence.com/saami-salami.html` (22 article files)
- `saami/index.html` Person schema: canonical name, url, image; removed alternateName
- Hub pages: OG/Twitter `saami-founder.jpeg` where added (`saami/index.html`)
- Organization/founder blocks unchanged from prior pass on `index.html`, `about.html`, `elisence.html`, `founder-saami.html`, `saami-salami.html`

### Canonical policy

- Page self-canonicals unchanged where already correct (`elisence.com` domain per `CNAME`)
- Founder schema references use `https://elisence.com/saami-salami.html` (not article hub URLs)

### Sitemap

- **No changes** — existing URLs retained

---

## Post-edit grep proof

| Pattern | Result (site HTML, excl. investor deck) |
|---------|----------------------------------------|
| `Sami Salami` | **0** matches |
| `also written as` | **0** matches |
| `also known as` | **0** matches |
| `alias clarification` | **0** matches |
| `Saami (Sami)` | **0** matches |
| `alternateName` | **0** matches |
| `rumour` / `accusation` | **0** matches |

**Note:** `phase5.html` contains “same personality rules” (unrelated to founder identity).

**Investor deck:** still contains `Saami Salami` in slide copy — intentionally skipped.

---

## Files changed (this pass)

### Root

`index.html`, `story.html`, `video.html`, `saami-bio.html`, `sami-profile.html`

### saami/

`index.html`, `bio.html`, `message.html`, `press-kit.html`, `timeline.html`, `youtube.html`, `articles.html`, `interviews.html`, `achievements.html`, `interview-family-0-18-phase15.html`, `interview-weight-intelligence.html`, `saami/saami/articles.html`, `saami/saami/interview-elisence-vision.html`, `saami/saami/interview-weight-intelligence.html`, `saami/saami/interviews.html`, `saami/saami/saami/interviews.html`, `saami/saami/timeline.html`

### articles/ (22 files)

Including `elisence-intro.html`, `who-is-saami-salami-asl-elisence-founder.html`, `founder-philosophy-saami-salami-asl.html`, `national-health-intelligence-saami-salami-asl.html`, and other knowledge-center articles.

---

## Skipped

| Item | Reason |
|------|--------|
| Investor deck + audit deck HTML | Forbidden scope |
| `pitch-system.html`, `deck-system.html`, `web-summit-board.html` | Pitch / summit materials |
| `saami-salami-asl-profile.html` | Case-variant path; left at `HEAD` to avoid Windows collision corruption |
| `elisence.online` domain | Not present in repo; `CNAME` is `elisence.com` |
| `sami-salami.html` and other deleted-on-remote alias pages | Not in sparse checkout / removed on `main` |

---

## Fail-condition check

- No redesign or layout change
- No file deletion or new pages
- No investor deck edits
- No unrelated health content rewrites (only founder-identity surfaces)
