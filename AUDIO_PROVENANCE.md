# KidsZone Nursery Rhymes Audio Provenance & Rights Audit

This document records the legal provenance, copyright classification, and production status for the 17 nursery rhymes in the KidsZone application: 13 with studio audio tracks (Category A) and 4 lyrics-only public-domain replacements (Category C).

---

## 1. Composition Copyright Classification

### Category A: Traditional Public Domain Folk Compositions
These songs are traditional folk compositions whose composers and lyricists lived in the 17th, 18th, or early 19th centuries, and are in the **Public Domain worldwide**:
1. **Twinkle Twinkle Little Star** — Melody: French traditional *Ah! vous dirai-je, maman* (1761); Lyrics: Jane Taylor (1806). Public domain.
2. **Johny Johny Yes Papa** — Traditional 19th-century nursery rhyme. Public domain.
3. **Baa Baa Black Sheep** — Melody: French traditional (1761); Lyrics: Traditional English (1744). Public domain.
4. **Humpty Dumpty** — Traditional English riddle rhyme (1797). Public domain.
5. **Jack and Jill** — Traditional English nursery rhyme (1765). Public domain.
6. **Rain Rain Go Away** — Traditional English nursery rhyme (1687). Public domain.
7. **Old MacDonald Had a Farm** — Traditional English/American folk song (traditional melody recorded 1917). Public domain.
8. **ચાકીબેન ચાકીબેન (Chakiben Chakiben)** — Traditional Gujarati folk balgeet (Anonymous traditional lore). Public domain.
9. **ઢીંગલી મારી (Dhingli Mari)** — Traditional Gujarati folk balgeet (Anonymous traditional lore). Public domain.
10. **એકડો સાવ સળેખડો (Ekdo Salekhdo)** — Traditional Gujarati counting folk rhyme (Anonymous traditional lore). Public domain.
11. **આવ રે વરસાદ (Aav Re Varsad)** — Traditional Gujarati monsoon celebration song (Anonymous traditional lore). Public domain.
12. **मछली जल की रानी है (Machli Jal Ki Rani)** — Traditional Indian kindergarten folk rhyme (Anonymous traditional lore). Public domain.
13. **आलू कचालू बेटा कहाँ गए थे (Aalu Kachalu)** — Traditional North Indian folk nursery rhyme (Anonymous traditional lore). Public domain.

### Category B: Cinema / Modern-Arrangement Works (RETIRED, 2026-11-25)
These 4 rhymes were **removed from the app**. Their MP3s were deleted from `backend/media/rhymes/audio/`,
their catalogue entries replaced (Category C), and their ids blocked everywhere they could resurface:
`RETIRED_RHYME_IDS` in `src/data/rhymesData.ts` (backend responses and on-device caches),
`RETIRED_RHYME_SLUGS` in `backend/rhymes/importing.py` (imports), migration
`rhymes/0002_retire_licensed_film_songs` (existing databases), and `--delete` on the rhyme sync in
`deploy_media_s3.py` (CDN bucket).

| Retired id | Work | Why |
|---|---|---|
| `lakdi-kathi` | लकड़ी की काठी (*Masoom*, 1983; Gulzar / R.D. Burman) | Under copyright |
| `chanda-mama` | चंदा मामा दूर के (*Vachan*, 1955; Prem Dhawan / Ravi) | Recording tied to the film song |
| `titli` | तितली उड़ी (associated with *Suraj*, 1966) | Under copyright in India |
| `bus-wheels` | The Wheels on the Bus (Verna Hills, 1939) | Status varies by territory |

> **Git history:** the 4 MP3s were committed in `3754c1d` and pushed before removal. Deleting them in a
> later commit does not remove them from history: anyone with repository access can still retrieve
> them. Purging requires a history rewrite (e.g. `git filter-repo`) and a force-push, which is a
> repository-owner decision. Also delete them from `backend/media_backup_*.zip` and any S3 bucket
> that was synced before the `--delete` change.

### Category C: Public-Domain Replacements (lyrics only, no recording yet)
Shown with Read-Along lyrics and the "Coming Soon" audio badge until a recording is produced.

| New id | Rhyme | Replaces | Status |
|---|---|---|---|
| `row-boat` | Row, Row, Row Your Boat | `bus-wheels` | Public domain: published 1852 (E. O. Lyte) |
| `mota-hathi` | एक मोटा हाथी | `chanda-mama` | Traditional, no known author |
| `upar-pankha` | ऊपर पंखा चलता है | `titli` | Traditional playground rhyme, no known author (20th-century: it refers to electric fans) |
| `bandar-mama` | बंदर मामा पहन पजामा | `lakdi-kathi` | Traditional balgeet, no known author |

"No known author" is low-risk but is not the same as verified public domain: anonymous works can
still have an owner. Before release, have a rights reviewer confirm the three Hindi rhymes, and have a
native speaker check the lyric text and the Gujarati / English lines (written from the commonly sung
versions).

### Recordings (applies to Category A too)
A public-domain *composition* does not make a *recording* public domain. For every MP3 that ships,
record who performed and produced it and under what licence (own studio, commissioned with a
work-for-hire agreement, or a licensed library). Recordings taken from YouTube or film soundtracks are
not cleared, even when the song itself is traditional.

---

## 2. Audio Signal & Silence Normalization Verification
- **Measurement Engine**: Real-time raw PCM decoding and RMS amplitude detection in 10ms windows via `backend/scripts/normalize_rhyme_silence.py`.
- **Threshold**: Audio onset (singing start time) must occur within `<= 0.18s` at a minimum signal level of `-30.0 dBFS`.
- **Results**: All 13 deployed MP3 tracks must pass verification (re-run the script after any audio change; the 17-track run predates the Category B removal) with onsets between `0.040s` and `0.170s` (measured on disk, exit code 0).

---

## 3. Commercial Launch Clearance
Option A (replace the Category B rhymes with public-domain ones) was implemented on 2026-11-25; see
Category B and C above. Option B (licensing the film recordings via Saregama / IPRS, and the Wheels on
the Bus arrangement via ASCAP / PRS) is no longer needed unless those songs are brought back.

---

## 4. Production Deployment & Cold Storage Specification
- **Offline Cold Backup**: Verified archive `backend/media_backup_20261124.zip` (24.8 MB) containing all 233 WebP character renders and the MP3 audio files. **It still contains the 4 retired Category B MP3s: rebuild it without them before syncing it off-site.** To ensure true off-site redundancy, the archive must be synchronized to secure cloud object storage (e.g. S3 Glacier / GCS Coldline) outside the local machine.
- **Repeatable S3 / CloudFront Deployment**: Automated deployment via `backend/scripts/deploy_media_s3.py`:
  - Enforces AWS modern S3 security (zero `--acl public-read` flags; uses `s3_bucket_policy.json`).
  - Employs two-tier cache headers: `max-age=31536000, immutable` for 3D character renders; `max-age=86400, must-revalidate` for rhyme audio tracks to prevent stale audio propagation on CDN.
  - Generates CloudFront CachePolicy forwarding all query strings to guarantee `?v=` version tags bust the edge cache.
- **Production EAS Build Gate**: `app.config.js` requires both `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_MEDIA_URL` (ending in `/media`) to be set, to start with `https://`, and not to use `example.com` placeholders.
- **Network Security**: Cleartext HTTP traffic is disabled in production builds (`usesCleartextTraffic: false`), permitted only in local development profiles.
