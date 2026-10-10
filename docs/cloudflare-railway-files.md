# Fichiers : Railway Bucket + Cloudflare

Architecture RandomStack pour les uploads / lectures d’images.

```
Navigateur
   │
   ├─ api.ton-domaine.io ──► Cloudflare (DNS/WAF) ──► Railway Express
   │                              │
   │                              │  POST /upload-file  (buffer → PutObject)
   │                              │  GET  /files/:id   (302 → URL présignée)
   │                              ▼
   └─ URL présignée GET ──────► Railway Bucket (S3)
```

Les fronts n’utilisent **jamais** l’URL bucket directement : toujours  
`VITE_API_URL + /files/{id}` via le helper `fileUrl()`.

---

## 1. Créer un Bucket Railway

1. [railway.com](https://railway.com) → ton projet
2. **New** → **Bucket**
3. Ouvre le bucket → **Credentials** / Variables
4. Note :
   - Endpoint
   - Bucket name
   - Access Key ID
   - Secret Access Key
   - Region (souvent `auto`)

### Variables sur le service API

Dans Railway → service `server` → **Variables** :

| Variable | Exemple |
|----------|---------|
| `S3_ENDPOINT` | `https://storage.railway.app` (valeur dashboard) |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | nom du bucket |
| `S3_ACCESS_KEY_ID` | … |
| `S3_SECRET_ACCESS_KEY` | … |

En local : copie `apps/server/.env.example` → `apps/server/.env` et remplis les mêmes clés.  
Sans `S3_*` → le serveur écrit dans `public/uploads/` (dev offline OK).

Au boot tu dois voir :

```
[Server] Prêt sur le port 4000 — fichiers: Railway S3 bucket
```

ou `local disk (public/uploads)`.

### CORS du bucket (upload navigateur futur / lecture cross-origin)

Quand tu passeras aux uploads présignés directs depuis le front, configure CORS sur le bucket (AWS CLI / dashboard) pour autoriser :

- `https://www.ton-domaine.io`
- `https://admin.ton-domaine.io`
- `http://localhost:5173` / `5174` (dev)

Methods : `GET`, `PUT`, `HEAD`  
Headers : `Content-Type`, `*`

Aujourd’hui l’upload passe encore par Express (`POST /upload-file`) : CORS bucket non bloquant pour ce flux.

---

## 2. Cloudflare devant l’API

### DNS

1. Domaine chez Cloudflare
2. Enregistrements (proxied ☁️) :

| Type | Name | Target |
|------|------|--------|
| CNAME | `api` | `xxx.up.railway.app` (ou domaine custom Railway) |
| CNAME | `www` | front client |
| CNAME | `admin` | extranet |

3. Railway → service API → **Settings → Networking → Custom Domain** → `api.ton-domaine.io`  
   Cloudflare SSL : **Full (strict)** une fois le certificat Railway OK.

### Fronts Vite

```env
# apps/client/.env.production
VITE_API_URL=https://api.ton-domaine.io

# apps/extranet/.env.production
VITE_API_URL=https://api.ton-domaine.io
```

### WAF / rate limit (recommandé)

- Rate limit sur `api.ton-domaine.io/upload-file` (ex. 20 req / min / IP)
- WAF managed rules activées
- Optionnel plus tard : captcha Cloudflare Turnstile avant upload public

---

## 3. Comportement code

| Route | Comportement |
|-------|----------------|
| `POST /upload-file` | Multer → `PutObject` bucket (ou disque local) + row Prisma `File` |
| `GET /files/:id` | 404 si absent · sinon **302** vers URL présignée (1 h) · local = `sendFile` |

Clé objet :

```
uploads/{CATEGORY}/{TYPE}/{CATEGORY}-{uuid}{ext}
```

ex. `uploads/POST/IMAGE/POST-abc.png`

---

## 4. Checklist de validation

1. Variables `S3_*` sur Railway API
2. Redéployer le service
3. Login extranet → upload logo / cover
4. Ouvrir Network : `GET /files/{id}` → **302** vers `storage.railway.app` (ou équivalent)
5. Image visible dans le client (`fileUrl`)
6. Domaine `api` derrière Cloudflare, `VITE_API_URL` pointant dessus

---

## 5. Suite possible

- Déplacer `POST /upload-file` sous `/ws` (auth admin)
- Upload **direct** navigateur → bucket via URL présignée PUT (0 egress service)
- Import public : captcha + rate limit + allowlist MIME
- Migrer les anciens fichiers `public/uploads/` vers le bucket (script one-shot)

---

## Coûts (rappel)

Railway Buckets : ~\$0,015 / Go / mois, **egress bucket gratuit**, ops API gratuites.  
Cloudflare Free suffit pour DNS + proxy + WAF basique.
