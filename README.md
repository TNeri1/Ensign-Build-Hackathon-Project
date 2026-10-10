# Venue Lost & Found

Lost-and-found for venues: staff log found items, the public searches a redacted listing and files lost reports,
claims are verified with challenge questions built from private details, and admins see inventory, chain of custody and analytics.

Requires Node 22.12 or newer. If `npm install` prints "install scripts blocked" (npm 12), that is fine: the SQLite binary ships prebuilt.

```bash
npm install
npm run seed   # demo data
npm run dev    # http://localhost:5173  (API :3001)
npm test
```

- Demo script: [DEMO.md](./DEMO.md)  ·  Developer guide: [AGENTS.md](./AGENTS.md)  ·  Backlog: [TASKS.md](./TASKS.md)
- Logins: `staff@venue.test` / `admin@venue.test`, password `demo1234`.

## Optional: fill intake from a photo (local AI, no internet)

On **Log item**, staff can take or upload a photo and the form pre-fills category, color and details
(only empty fields; staff check before saving). The photo is read by a vision model **on your own machine**
through an OpenAI-compatible endpoint. Without one running, the form simply works by hand.

```bash
# Ollama (default endpoint http://localhost:11434/v1)
ollama pull qwen2.5vl:7b
ollama serve            # if it is not already running
npm run dev

# or LM Studio: load a vision model, start its server, then
VISION_URL=http://localhost:1234/v1 VISION_MODEL=<model id> npm run dev
```

Settings (env): `VISION_URL` (`off` disables), `VISION_MODEL` (default `qwen2.5vl:7b`), `VISION_TIMEOUT_MS` (default 60000).

