# Env + Cloudflare + Railway Bucket

## Quelle `.env` pour quel usage ?

| Fichier | Qui le lit | Rôle |
|---------|------------|------|
| **`/.env`** | Docker Compose | Postgres Docker, ports, CORS, S3 optionnel |
| **`apps/server/.env.local`** | Node hors Docker | DB `localhost:5435`, secrets, S3 |
| **`*.env.example`** | Humains / git | Templates sans secrets |
| **Railway Variables** | Prod API | Source de vérité en production |

Avec Docker : Compose injecte les vars + `RUNNING_IN_DOCKER=true` → **`.env.local` ne peut pas écraser** `DATABASE_URL` (`postgres_db`).

Hors Docker : `apps/server/.env.local` gagne (host `localhost:5435`).

Au boot tu dois voir :
```
[Server] Prêt sur le port 4000 — fichiers: local disk (public/uploads)
```
ou `Railway S3 bucket` si les 4 clés `S3_*` sont remplies.

---

## Architecture cible

```
Browser
  ├─ www.randomstack.io     → Cloudflare → Client (Pages / Railway)
  ├─ admin.randomstack.io   → Cloudflare → Extranet
  └─ api.randomstack.io     → Cloudflare → Railway Express
                                   │
                                   ├─ POST /upload-file  → PutObject bucket
                                   └─ GET  /files/:id    → 302 signed GET
                                              │
                                              ▼
                                       Railway Bucket (privé)
```

Le navigateur **ne connaît jamais** tes secrets S3. Il utilise `VITE_API_URL + /files/{id}`.

---

## Mise en place pas à pas

### 1. Railway — Bucket

1. Projet Railway → **New → Bucket**
2. Credentials → note `endpoint`, `region`, `bucket`, `accessKeyId`, `secretAccessKey`
3. Sur le **service API** → Variables :

```
S3_ENDPOINT=https://….railway.app   # valeur dashboard
S3_REGION=auto
S3_BUCKET=…
S3_ACCESS_KEY_ID=…
S3_SECRET_ACCESS_KEY=…
CORS_ALLOW_ALL=false
CLIENT_ORIGIN=https://www.randomstack.io
EXTRANET_ORIGIN=https://admin.randomstack.io
SESSION_SECRET=<long-random>
DATABASE_URL=<postgres Railway>
```

4. CORS bucket (utile plus tard pour PUT présigné navigateur) :
   - Origins : `https://www.randomstack.io`, `https://admin.randomstack.io`
   - Methods : `GET`, `PUT`, `HEAD`
   - Headers : `Content-Type`

Aujourd’hui l’upload passe encore par Express → CORS bucket non bloquant pour V1.

### 2. Cloudflare — DNS

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `api` | `xxx.up.railway.app` | ☁️ |
| CNAME | `www` | front client | ☁️ |
| CNAME | `admin` | extranet | ☁️ |

- Railway → Custom Domain `api.randomstack.io`
- SSL Cloudflare : **Full (strict)**
- Rate limit recommandé sur `POST /upload-file`

### 3. Fronts prod

```env
# client + extranet
VITE_API_URL=https://api.randomstack.io
```

### 4. Flux actuel dans RandomStack (V1)

1. Extranet `POST /upload-file` (buffer) → API → `PutObject` bucket (ou disque si pas de S3)
2. Front affiche `fileUrl(id)` → `GET /files/:id` → **302** signed GET (TTL ~1h)
3. Plus tard : presign PUT direct navigateur → bucket (0 egress service)

### 5. Checklist

- [x] Bucket créé + vars `S3_*` sur Railway API
- [x] Redéployer → log `fichiers: Railway S3 bucket`
- [x] Upload logo / cover depuis extranet
- [x] Network : `/files/{id}` → 302 vers storage
- [ ] `api` derrière Cloudflare + `VITE_API_URL` prod
- [ ] `CORS_ALLOW_ALL=false` + `CLIENT_ORIGIN` / `EXTRANET_ORIGIN`

### Pièges

- Bucket **privé** (pas world-readable)
- Ne jamais committer les clés (`tid_` / `tsec_`) dans `.env.example`
- TTL signed URL trop long = lien partageable trop longtemps
- En Docker local, `S3_*` vides = disque OK pour développer offline
