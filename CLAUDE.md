# FAT study guide

## Goal

One web app with one job: teach the user just enough FAT to solve `Baitap_HTTT.pdf`, using the lecture
`Bai02_Quan_ly_tap_tin.pdf`. Don't teach the whole course. Every section must serve a question in the
exercise (bài 1: MBR partitions; bài 2a–e: a FAT32 volume read from hex dumps).

**Audience: students who are "mất gốc"** (weak on the basics). Assume they don't know hex, bytes,
little-endian, or what a sector is.

**The exam is the spine.** The user's teacher gives a test in the same format as Baitap_HTTT. The user
found the earlier version messy: concepts sat on 8 separate pages away from where they were used, nothing
said what mattered for the test, and content hidden behind clicks was never opened ("người dùng sẽ không bao
giờ bấm vào các ô để xem"). So:

- **One page per exam question** (`Mbr`, `Boot`, `Fat`, `Tree`, `Operations`), after two foundation pages
  (`HexSkills`: reading a dump; `DiskOverview`: how MBR, volume, FAT, RDET/SDET, clusters connect, with
  the exam question under each part). Concepts are taught on the question page that uses them ("Hiểu
  nhanh"), not on separate pages.
- **Importance is explicit.** `<Must>` (yellow highlight) marks what to memorise; every Must also appears
  in a block of `Lookup.jsx`. Each `<Recipe>` has a `skip` line listing what the exam never asks.
- **"Bảng tra" next to each question page.** The user asked for a lookup table at the side. The page's
  `lookup` keys in `GROUPS` pick `Lookup.jsx` blocks (offsets, codes, formulas, and from 2b on the numbers
  found in 2a for the mini and real disk). It is a sticky right column at ≥1360px and a drawer behind a
  "Bảng tra" button below that. "Bảng phải thuộc" (`Reference.jsx`) renders the same blocks.
- **Pages link to each other.** `<DiskStrip on=…>` shows where on the disk the page works; `<Known>` lists
  the numbers taken from earlier questions; results say which later question uses them.
- **Nothing hidden behind a click.** No `<details>`, no "bấm để xem" checks or answers, no click-to-explain
  bytes. Hex dumps colour what a step reads and list each field (position, bytes, reversal, meaning) under
  the dump (`focus`, `list="entries"`, `list="cells"`).
- **Mini first, real right after, same page.** Each question page solves the mini disk
  (`server/Data/hex-dumps.json`, round numbers) step by step, then applies the same steps to Baitap_HTTT in
  a violet `<Real>` block from `RealExercise.jsx` (byte locations as printed in the PDF, arithmetic shown,
  final answer). Explain FAT with analogies: directory = mục lục, FAT = linked list.

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
| `client/src/fat/annotate.js` | Pure decoders (MBR, boot sector, FAT32 cells, directory entries) and the static notes under dumps (`focusNotes`, `entryRows`, `fatCells`) |
| `client/src/fat/annotate.test.js` | Pins the mini dumps to the answers shown on the page |
| `client/src/fat/baitap.fixture.json`, `baitap.test.js` | Dumps transcribed from Baitap_HTTT.pdf (test data only) and the test that pins every number in `RealExercise.jsx` |
| `client/src/components/` | `HexDump` (coloured dump + list), `Calculators`, shared `Study` blocks |
| `client/src/sections/` | `Start`, `HexSkills`, `DiskOverview`, `Mbr` (câu 1), `Boot` (2a), `Fat` (2b), `Tree` (2b), `Operations` (2c–e), `RealExercise` (real-exercise block per question), `Lookup` (memorise blocks for the Bảng tra column), `Reference` (Bảng phải thuộc + lỗi hay gặp), `Glossary` (+ calculators) |
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
- **Neutral, textbook tone.** No slogans, jokes or chatty taglines: the user found "FAT vừa đủ làm bài",
  "Mang vào phòng thi trong đầu", "Sẵn sàng?" and book analogies like "phần ruột cuốn sách" cringe. Section tags
  are just the group name or the exam question (Bắt đầu, Nền tảng, Câu 2a, Ôn tập).
- **No slide images or slide-number references.** The user found the crops hard to read. Show what's
  needed directly as text and small tables.
- The app shows **one page per screen** (hash routing in `App.jsx`: `#cau-1`, `#cau-2a`, …; old hashes
  are redirected in `OLD_HASHES`) with a course outline, progress saved in `localStorage`
  (`fat-guide:done`), and Trước/Tiếp at the bottom. New pages are added to `GROUPS` in `App.jsx`.
- Every question page has the same skeleton: `<PageHead>` → `<Ask>` (đề cho / đề hỏi, in the exam's words)
  → `<DiskStrip>` → "Hiểu nhanh" → "Cách giải" `<Recipe>` → "Làm mẫu trên đề mini" (`<Known>`, `<Steps>`,
  `<Final>`) → "Làm trên đề thật" (`<RealX />`) → "Dễ sai" `<Traps>`. Keep that order on new pages.
- Each worked step reads top to bottom: 1–2 sentences → its own `<HexDump>` showing only the rows it needs
  → a visible `<Result>` or `<Calc>`. Never put one dump at the top of a page for the steps to point back to.
- **Keep prose short. The user rejected a wordy version as hard to understand.** No paragraph longer than 2
  sentences, no meta text ("trang này dạy…"), no explanation the exam doesn't need. Prefer tables, numbers
  and arithmetic over sentences.
- Write for a beginner: plain words, show the arithmetic (`26 = 2 × 16 + 6 = 38`), say where a byte is
  (row, column). New terms go in `Glossary.jsx` with a one-line meaning.
- **Light/dark is the learner's choice**, not the system's: the button in the top bar sets `data-theme` on
  `<html>` and saves it in `localStorage` (`fat-guide:theme`); an inline script in `index.html` applies it
  before the first paint (the system setting is only the default before any choice). New colours need a
  light value on `:root` and a dark value in both dark blocks of `styles.css`.
- Group digits with no-break spaces (`2 097 152`, as `num()` in `annotate.js` does) so a number
  never wraps mid-way.
- Commit messages: `type: summary` (e.g. `feat: add FAT chain lesson`, `fix: correct cluster 11 sector`).

## Known pitfalls

- **The `supabase password` file in the repo root is a secret.** It is gitignored; never read it into code,
  commit it, or paste it anywhere.
- **The mini disk must stay self-consistent.** If you edit `server/Data/hex-dumps.json`, also update the
  layout constants in `client/src/fat/dumps.js`, the hand-written answers in `sections/`, and run `npm test`
  (it pins partitions, the 6/2/2 layout, FAT chains, the tree and the long-name checksum entry).
- **Answer text is hand-written in `sections/`**, separately from the decoders. A change to a dump or
  formula means updating both the prose answers and the tests.
- **`what` and `calc` strings from `annotate.js` render as HTML.** Any text that comes from dump bytes
  must go through `esc()`. `entryRows` returns plain text that React escapes.
- **A `<Must>` added to a question page must also go in its `Lookup.jsx` block**, and a new trap in
  `<Traps>` belongs in the "Lỗi hay gặp" list of `Reference.jsx`. The numbers in `KnownNumbers` repeat the
  2a/2b answers; change them with the dumps.
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
- **CORS origins must match exactly** (scheme and host). `Program.cs` strips a trailing `/` from configured
  origins, because the first deploy failed with `FRONTEND_ORIGIN` set to `https://….vercel.app/` and secrets
  can't be viewed to spot that. On the VM the single allowed origin is the `FRONTEND_ORIGIN` repo secret; Vercel preview URLs differ from production and are blocked.
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
- **Real-exercise answers live only in `RealExercise.jsx`**, one exported block per question. Every
  number there is pinned by `baitap.test.js` against the transcribed dumps; change both together.
- FAT-specific traps for the user (little-endian, cluster numbering from 2, no S_RDET on FAT32, FAT2 copy,
  E5/LFN entries, and so on) are listed under "Dễ sai" on each question page and together under "Lỗi hay
  gặp" (`sections/Reference.jsx`). Keep both in sync.
- **`HexDump` is not interactive.** The user said learners never click. Don't bring back click-to-select
  bytes or an info box; put what a step needs in the list under the dump.
