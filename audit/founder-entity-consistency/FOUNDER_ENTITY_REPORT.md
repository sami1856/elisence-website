# Founder Entity Consistency Report

**Date:** 2026-05-28  
**Scope:** SEO / schema / image metadata only — no layout, copy, or design changes.

## Canonical founder identity (locked)

| Field | Value |
|-------|-------|
| Name | `Saami Salami Asl` |
| URL | `https://elisence.com/saami-salami.html` |
| Image | `https://elisence.com/assets/saami-founder.jpeg` |

---

## 1. Files changed (13)

| File | Change summary |
|------|----------------|
| `saami-salami.html` | Canonical self; OG/Twitter; Person schema name/url/image |
| `founder-saami.html` | Canonical → saami-salami; OG/Twitter; new Person JSON-LD |
| `founder-story-saami-salami-asl.html` | Article canonical (self); OG/Twitter; Article + author Person schema |
| `sami-salami.html` | Fixed broken JSON-LD; canonical; OG/Twitter; Person schema |
| `sami-salami-asl.html` | Canonical; OG/Twitter; Person schema |
| `sami-salami-profile.html` | Canonical; OG/Twitter; Person JSON-LD added |
| `sami-profile.html` | Canonical; OG/Twitter; Person JSON-LD added |
| `saami-salami-profile.html` | Canonical; OG/Twitter; Person JSON-LD added |
| `saami-bio.html` | Canonical; OG/Twitter; Person JSON-LD added |
| `index.html` | Organization.founder url + image; removed `alternateName` |
| `about.html` | Organization.founder url + image + jobTitle |
| `elisence.html` | Organization.founder url + image |
| `articles.html` | CollectionPage author Person url + image |

---

## 2. Metadata / schema fields added or standardized

### Founder-profile pages (canonical → `saami-salami.html`)

Added or corrected on: `saami-salami.html`, `founder-saami.html`, `sami-salami.html`, `sami-salami-asl.html`, `sami-salami-profile.html`, `sami-profile.html`, `saami-salami-profile.html`, `saami-bio.html`

```html
<link rel="canonical" href="https://elisence.com/saami-salami.html" />
<meta property="og:type" content="profile" />
<meta property="og:title" content="Saami Salami Asl — Founder of Elisence" />
<meta property="og:url" content="https://elisence.com/saami-salami.html" />
<meta property="og:image" content="https://elisence.com/assets/saami-founder.jpeg" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://elisence.com/assets/saami-founder.jpeg" />
```

Person JSON-LD (preserved `jobTitle`, `affiliation` where present):

```json
{
  "@type": "Person",
  "name": "Saami Salami Asl",
  "url": "https://elisence.com/saami-salami.html",
  "image": "https://elisence.com/assets/saami-founder.jpeg"
}
```

### Article page (own canonical preserved)

`founder-story-saami-salami-asl.html`:

```html
<link rel="canonical" href="https://elisence.com/founder-story-saami-salami-asl.html" />
```

Article JSON-LD with author Person pointing to canonical founder entity.

### Organization founder references

`index.html`, `about.html`, `elisence.html` — `founder` Person block:

- `"name": "Saami Salami Asl"`
- `"url": "https://elisence.com/saami-salami.html"`
- `"image": "https://elisence.com/assets/saami-founder.jpeg"`

`index.html` — removed schema `alternateName` array (alias consolidation in structured data only).

`articles.html` — CollectionPage `author` Person url + image.

---

## 3. URLs standardized

All Person / founder schema `url` fields now use:

`https://elisence.com/saami-salami.html`

Previously inconsistent values corrected:

- `https://elisence.com/founder-saami.html` → canonical founder URL
- `https://www.elisence.com/saami-salami.html` → non-www canonical

---

## 4. Image refs standardized

All founder-related schema and social meta now use:

`https://elisence.com/assets/saami-founder.jpeg`

No in-body `<img>` founder photos exist on founder pages in this sparse checkout; investor deck Web Summit portrait (`samiwebsummit.jpeg`) intentionally untouched.

---

## 5. Pages intentionally skipped

| Page / area | Reason |
|-------------|--------|
| `elisence-investor-deck.html` and all deck variants | Forbidden: investor deck / Web Summit materials |
| `audit/investor-deck-*` proof HTML | Audit artifacts; not live site SEO |
| `story.html`, `video.html` | No existing JSON-LD / OG founder schema; body copy unchanged per scope |
| Product / evidence / Qatar / phase pages | Navigation links only; no founder schema surfaces |
| Individual article HTML under `articles/` | Not present in sparse checkout; hub schema updated via `articles.html` |
| CSS, layout, navigation hrefs, visible body copy | Out of scope |

---

## 6. Grep proof

### `saami-founder.jpeg` (founder meta/schema only)

```
founder-story-saami-salami-asl.html  og:image, twitter:image, Article.image, author.image
founder-saami.html                   og:image, twitter:image, Person.image
saami-salami.html                    og:image, twitter:image, Person.image
sami-salami.html                     og:image, twitter:image, Person.image
sami-salami-asl.html                 og:image, twitter:image, Person.image
sami-salami-profile.html             og:image, twitter:image, Person.image
sami-profile.html                    og:image, twitter:image, Person.image
saami-salami-profile.html            og:image, twitter:image, Person.image
saami-bio.html                       og:image, twitter:image, Person.image
index.html                           Organization.founder.image
about.html                           Organization.founder.image
elisence.html                        Organization.founder.image
articles.html                        author.image
```

### Canonical founder URL (`rel="canonical"` → saami-salami.html)

```
saami-salami.html
founder-saami.html
sami-salami.html
sami-salami-asl.html
sami-salami-profile.html
sami-profile.html
saami-salami-profile.html
saami-bio.html
```

Article self-canonical:

```
founder-story-saami-salami-asl.html → founder-story-saami-salami-asl.html
```

### Person schema `"url": "https://elisence.com/saami-salami.html"`

All 13 changed files — 13 matching Person/founder url references (8 standalone Person pages + 3 Organization.founder + 1 CollectionPage author + 1 Article author).

### Fail-condition check

- No redesign, layout, or CSS changes
- No visible body copy rewritten
- No non-founder assets modified
- No new schema aliases introduced (`alternateName` removed from index schema only)
- Investor deck / Web Summit images untouched

---

## Outcome

Google structured-data signals now converge on one founder entity:

**Saami Salami Asl** + **https://elisence.com/saami-salami.html** + **https://elisence.com/assets/saami-founder.jpeg**
