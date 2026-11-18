# Pokémon GO Quest Finder

React + Vite + React-Leaflet frontend, FastAPI backend. Shows PokéStops whose quest is
**Make an Excellent Throw** with an **Eternatus** reward, from NYCPokeMap.

## Run (two terminals)

Backend (PowerShell):

```powershell
cd backend
.\venv\Scripts\Activate.ps1          # venv already created; otherwise: python -m venv venv; pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173. Vite proxies `/api` to the backend.

To try the UI without contacting NYCPokeMap, set `USE_SAMPLE_DATA=1` before starting the backend
(PowerShell: `$env:USE_SAMPLE_DATA=1`). The page then shows a "SAMPLE DATA" banner.

## Tests

```powershell
cd backend;  .\venv\Scripts\python -m pytest -q
cd frontend; npm test
```

## How the source is read (verified from the site's own script, `js/script_quest.js`)

- The Quest page calls `GET https://nycpokemap.com/quests.php?quests[]=<filter>`.
- Eternatus is filter `4,0,890` (reward type 4 = candy, id 890). It is **not** an encounter filter.
- Each record has `lat`, `lng`, `name`, `conditions_string` (task), `rewards_string`, `rewards_ids`.
- The backend keeps records where the reward is Eternatus **and** `conditions_string` equals
  "Make an Excellent Throw" (case/whitespace-insensitive, exact — not a substring).

**Not yet verified against live data:** the exact text of `conditions_string` and the `rewards_ids`
shape in a real Eternatus record. If real results never appear, check the real task text and adjust
`TARGET_TASK` in `backend/.env` (see `.env.example`). Source requests are cached 60 s, and Refresh
never hits the source more than once every 10 s. Check NYCPokeMap's terms before public deployment.

## Layout

`backend/app/services/source_client.py` (fetch only), `quest_filter.py` (matching), `cache.py`;
`frontend/src/` components, `services/questApi.js`, `utils/distance.js`, `utils/mapsUrl.js`.
User location never leaves the browser.
