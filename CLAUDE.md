# FAT study guide

## Goal

One web app with one job: teach the user just enough FAT to solve `Baitap_HTTT.pdf`, using the lecture
`Bai02_Quan_ly_tap_tin.pdf`. Don't teach the whole course. Every section must serve a question in the
exercise (bài 1: MBR partitions; bài 2a–e: a FAT32 volume read from hex dumps).

**Audience: students who are "mất gốc"** (weak on the basics). Assume they don't know hex, bytes,
little-endian, or what a sector is.

**Foundations come first ("Kiến thức nền", `sections/Concepts.jsx` plus `WhatIsFat`/`HexBasics`).** The user
said the basics were too thin: learners must know what MBR, a partition, the volume regions, the boot
sector, the FAT, RDET/SDET and an entry are before the exercise. Each gets one concept page answering
*what it is*, *what it's for* and *what it looks like* (a diagram plus how it appears in hex), without the
byte-by-byte decoding the lessons do. Concept pages use generic examples (README.TXT, PHOTOS, file A/B) so
they don't give away mini-exercise answers. Each mini lesson starts with `<Prereq>` links back to them.

**Teaching approach: divide and conquer on a mini exercise.** Don't copy Baitap_HTTT into the lessons.
The lessons solve a small made-up disk (`server/Data/hex-dumps.json`) with the same question types and
round numbers, split into small `<SubStep>`s, each ending in a one-question `<Check>`. Only the last
lesson ("Làm đề thật") refers to the real exercise: a mini → real number mapping plus collapsed answers,
no copied hex dumps. Explain FAT with analogies: directory = mục lục, FAT = linked list / truy tìm kho báu.

## Stack

- Frontend: React 18 + Vite in `client/`.
- Backend: ASP.NET Core 8 Web API (C#) in `server/`. It is API only and does not serve the frontend.
  Structure: `Controllers/` (`[ApiController]` classes, no minimal-API `Map*` endpoints), `Services/`
  (interface + implementation, registered in DI), `Models/`, `Data/`. The user wants this conventional
  controller layout.
- Frontend and backend are deployed separately, both continuously on push to `main`:
  - API on the user's **Azure VM (Ubuntu 22.04)**. `.github/workflows/deploy-api.yml` tests, builds
    `server/Dockerfile`, pushes `ghcr.io/hieule832/fat-guide-api:<sha>`, copies `deploy/vm/` to
    `/opt/fat-guide` over SSH and runs `deploy.sh` (docker compose: API + Caddy for HTTPS).
  - Frontend on Vercel (root directory `client`), which auto-deploys from GitHub.
  - Steps for the user are in `docs/DEPLOY.md` (Vietnamese).
- PostgreSQL or a cache: don't add one yourself. Ask the user, who will create a Supabase database or an
  Upstash Redis. The guide needs neither today.
- Decide everything else yourself without asking.

## Layout

| Path | What |
| --- | --- |
| `server/Data/hex-dumps.json` | Hex dumps of the mini practice disk (source of truth) |
| `server/Controllers/HexDumpsController.cs` | `GET /api/hex-dumps`, `GET /api/hex-dumps/{id}` |
| `server/Controllers/HealthController.cs` | `GET /api/health` (Azure health check, deploy smoke test) |
| `server/Services/` | `IHexDumpService`, `JsonHexDumpService` (loads and validates the JSON at startup) |
| `server/Models/` | `HexDump`, `HexDumpSummary` |
| `client/src/api/hexDumps.js` | Fetches a dump from the API |
| `client/src/fat/dumps.js` | Mini disk layout constants (data start 10, 2 sectors/cluster, FAT1 at sector 6) and `parseHex` |
| `client/src/fat/annotate.js` | Pure decoders: MBR, boot sector, FAT32 elements, directory entries |
| `client/src/fat/annotate.test.js` | Pins the dumps to the answers shown on the page |
| `client/src/components/` | `HexDump` (clickable dump), `Calculators`, shared `Study` blocks |
| `client/src/sections/` | `Intro` (start, byte/hex), `WhatIsFat`, `Concepts` (6 concept pages), `MiniExercise`, `Mbr`, `Volume`, `Operations`, `RealExercise`, `Reference`, `Glossary` |
| `client/vercel.json` | Vercel build settings |
| `deploy/vm/` | VM stack: `docker-compose.yml` (api + caddy), `Caddyfile`, `deploy.sh` (run by CD), `setup.sh` (one-time Docker install) |
| `.github/workflows/deploy-api.yml` | CD for the API to the VM |
| `docs/DEPLOY.md` | Deploy guide for the user (Azure + Vercel) |

## Commands

```bash
dotnet run --project server       # API at http://localhost:5080, Swagger at /swagger (Development)
cd client && npm install          # once
cd client && npm run dev          # http://localhost:5173, proxies /api to localhost:5080
cd client && npm test             # decoder tests (node:test), read server/Data/hex-dumps.json
cd client && npm run build        # static files in client/dist
```

Backend in Docker:

```bash
docker build -t fat-guide-api server
docker run --rm -p 8080:8080 fat-guide-api     # http://localhost:8080/api/hex-dumps
cd client && API_PROXY_TARGET=http://localhost:8080 npm run dev   # point the dev frontend at the container
```

## Environment variables

There are no `.env` files in the repo; only `client/.env.example` (a template, tracked via `!.env.example`).

| Where | How it's set | Variables |
| --- | --- | --- |
| Frontend, local | `client/.env.local` (gitignored) or the shell | `API_PROXY_TARGET` (Vite proxy target, default `http://localhost:5080`), `VITE_API_BASE_URL` (leave empty) |
| Frontend, Vercel | Project Settings → Environment Variables | `VITE_API_BASE_URL=https://<azure-app>` (build time) |
| Backend, local | `appsettings.Development.json` + `launchSettings.json` | `Cors:AllowedOrigins`, `ASPNETCORE_ENVIRONMENT=Development`, port 5080 |
| Backend, VM | `/opt/fat-guide/.env`, written by the workflow each deploy | `API_IMAGE`, `API_DOMAIN`, `FRONTEND_ORIGIN` (→ `Cors__AllowedOrigins__0`) |
| Backend, Docker locally | `docker run -e …` | `Cors__AllowedOrigins__0=…`; `ASPNETCORE_URLS` is set in the Dockerfile |
| GitHub Actions | repo secrets (the user wants all of them as secrets) | `VM_SSH_KEY`, `VM_HOST`, `VM_USER`, `API_DOMAIN`, `FRONTEND_ORIGIN` |

ASP.NET does not read `.env` files; use appsettings, environment variables or `dotnet user-secrets`. Any
future secret (e.g. a Supabase connection string) goes in user-secrets locally and Azure App Settings,
never in the repo.

## Conventions

- UI language is Vietnamese with full diacritics.
- **No slide images or slide-number references.** The user found the crops hard to read. Show what's
  needed directly as text and small tables.
- The app shows **one lesson per screen** (hash routing in `App.jsx`: `#mbr`, `#boot`, …) with a course
  outline, progress saved in `localStorage` (`fat-guide:done`), and Trước/Tiếp at the bottom. New lessons
  are added to `GROUPS` in `App.jsx`.
- Each lesson goes: `<Goal>` (1 line) → `<SubSteps>` → collapsed `<Answer>` "Ghép lại" that assembles the
  part's full answer. Each sub-step reads top to bottom: 1–2 sentences or a tiny table → its own
  `<HexDump id focus={[[offset, len], …]} from to />` showing only the rows it needs with its bytes lit and
  the rest dimmed → a `<Check>`. Never put one dump at the top of a lesson for the steps to point back to
  (the user flagged that ordering), and never preselect a field: the info box would spoil the next step.
- **Keep it short. The user rejected a wordy version as hard to understand.** No paragraphs longer than 2
  sentences, no meta text ("trang này dạy…"), no explanation the exercise doesn't need. Answers are a table
  plus at most one line. A lesson page should stay under ~180 words outside hex dumps and answers.
- Write for a beginner: plain words, show the arithmetic (`26 = 2 × 16 + 6 = 38`), say where a byte is
  (row, column). New terms go in `Glossary.jsx` with a one-line meaning.
- Commit messages: `type: summary` (e.g. `feat: add FAT chain lesson`, `fix: correct cluster 11 sector`).

## Known pitfalls

- **The `supabase password` file in the repo root is a secret.** It is gitignored; never read it into code,
  commit it, or paste it anywhere.
- **The mini disk must stay self-consistent.** If you edit `server/Data/hex-dumps.json`, also update the
  layout constants in `client/src/fat/dumps.js`, the hand-written answers in `sections/`, and run `npm test`
  (it pins partitions, the 6/2/2 layout, FAT chains, the tree and the long-name checksum entry).
- **Answer text is hand-written in `sections/`**, separately from the decoders. A change to a dump or
  formula means updating both the prose answers and the tests.
- **`calc` and `ent` strings from `annotate.js` render as HTML.** Any text that comes from dump bytes
  must go through `esc()`.
- **Don't put `Urls` in `appsettings.json`.** It overrides `ASPNETCORE_URLS`/`HTTP_PORTS`, so the container
  binds to `localhost` and can't be reached. The local port (5080) lives in
  `server/Properties/launchSettings.json`, which only `dotnet run` reads.
- **CORS origins come from config** (`Cors:AllowedOrigins`). Development allows `http://localhost:5173`;
  production allows none. Add the real frontend origin there when the frontend is deployed, or set
  `VITE_API_BASE_URL` at frontend build time if the API lives on another host.
- **`vite.config.js` must use `loadEnv`** to read `API_PROXY_TARGET`. Vite only puts `.env` values into
  `import.meta.env`, not into `process.env` of the config, so a plain `process.env` read ignores `.env.local`.
- **`VITE_API_BASE_URL` is baked in at build time.** Changing it on Vercel needs a redeploy. Use the origin
  only (`https://x.azurewebsites.net`), no `/api`; a trailing slash is stripped in `api/hexDumps.js`.
- **CORS origins must match exactly** (scheme, host, no trailing slash). On the VM the single allowed origin
  is the `FRONTEND_ORIGIN` repo secret; Vercel preview URLs differ from production and are blocked.
- **The API must be served over HTTPS.** The Vercel page is `https://`, and browsers block calls to a plain
  `http://IP` (mixed content). That's why Caddy sits in front with a domain (Azure Public IP "DNS name
  label" → `*.cloudapp.azure.com`) and needs NSG inbound 80 and 443 open.
- **The `.pem` key is a secret.** Never ask the user to paste it into chat, never read or commit it
  (`*.pem` is gitignored). It only lives in the `VM_SSH_KEY` GitHub secret.
- **GHCR image names must be lowercase**: the workflow uses `${GITHUB_REPOSITORY_OWNER,,}`. The VM logs in
  with the job's `GITHUB_TOKEN` (sent on stdin) for each deploy and `deploy.sh` logs out afterwards.
- **Test the VM stack locally before changing it**: build the image, copy `docker-compose.yml` and
  `Caddyfile` to a scratch dir with `.env` (`API_DOMAIN=localhost`), `docker compose -p test up -d`, then
  `curl -k https://localhost/api/health`. Lint the workflow with `docker run rhysd/actionlint:1.7.1` and the
  scripts with `koalaman/shellcheck:v0.10.0`.
- **`HexDump` keeps its "Thử lại" button** for when the API is restarting during a deploy; don't remove it.
- **Swagger is Development-only.** In the container (Production) `/swagger` is 404 on purpose.
- **Don't serve the frontend from the backend again** (no `wwwroot`, `UseStaticFiles` or SPA fallback). The
  user asked for them to be separate.
- **`pkill -f <name>` can match the shell running it** and kill your own command. Stop the dev server by
  PID or with Ctrl+C instead.
- **Headless Firefox hangs in this environment.** For screenshots use Playwright's Chromium, installed outside
  the repo (`npm i playwright@1.48.2 && npx playwright install chromium` in a scratch folder). Check 390px
  width for horizontal overflow: grids need `minmax(0, 1fr)` columns or wide hex dumps stretch the page.
- **Hex dump columns are sized in `ch`, which depends on font size.** The header row (0–F) must use the same
  font size as the byte rows or it shrinks and drifts out of line. Check with a script that compares header
  and byte cell centres (expect 0 px), not by eye.
- **A fixed drawer inside a grid needs `align-self: stretch`**; the desktop sidebar's `align-self: start`
  otherwise shrinks the mobile "Mục lục" panel.
- **Headings use Bricolage Grotesque** (proportional, has Vietnamese). Keep monospace for hex, code and
  labels only; diacritics look cramped in mono headings.
- **2c, 2d, 2e each start from the original mini disk**, as in the real exercise. Offsets in their answers
  (entry 1420, 2040, 2060…) assume that.
- **Real-exercise answers live only in `RealExercise.jsx`** and were verified against Baitap_HTTT.pdf
  (git history before the mini rewrite has the transcribed real dumps and tests if they're ever needed).
- FAT-specific traps for the user (little-endian, cluster numbering from 2, no S_RDET on FAT32, FAT2 copy,
  E5/LFN entries, and so on) are listed on the page under "Lỗi hay gặp" (`sections/Reference.jsx`). Keep
  that list in sync when you add lessons.
