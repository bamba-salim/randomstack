# Audit Randomstack — Sécurité & Perf

> ℹ️ **Source de vérité = le code.**
>
> Branche : `master` · HEAD : `86a6580` (optimise css)
>
> Routes plates : `/` · `/ws` · `/auth` · `/auth/admin`
>
> Dernière passe code : **15 octobre 2026**
>
> Légende : <span style="color:#e03e3e">[x]</span> = fait · `[ ]` = à faire

---

## Ordre de fix recommandé

1. ~~**Sécurité immédiate** — auth sur `POST /upload-file` + fixer cover `'POST'` → `TABLE.POST`~~
2. **Sécu API** — helmet + `trust proxy` + `express.json({ limit })` + garde `CORS_ALLOW_ALL` en prod
3. **Validators / contenu** — ~~`validateSaveTechnology`~~ + sanitize HTML serveur
4. **Ops** — session store PG + Bucket Railway / DNS (infra)
5. ~~**Produit** — enrichir filtre client admin posts (auteur + résumé)~~

---

## CRITICAL

- <span style="color:#e03e3e">[x]</span> **`POST /upload-file` authentifié** — `AuthMiddleware.isAuthenticated` + rate-limit — `web-service.ts`
- <span style="color:#e03e3e">[x]</span> **Secret de session** — env + refus prod si `< 32` caractères ; `secure` conditionnel — `session.middleware.ts`
- <span style="color:#e03e3e">[x]</span> **Seed admin** — plus de password dans stdout (email loggé à la création seulement ; OK résiduel) — `seed.action.ts`
- <span style="color:#e03e3e">[x]</span> **Alias `#utils` / `#scheduler`** — `apps/server/package.json` pointe bien sous `src/`
- <span style="color:#e03e3e">[x]</span> **`file.dto.ts` versionné** — `packages/commons/src/dtos/core/file.dto.ts`
- <span style="color:#e03e3e">[x]</span> **URLs images** — helper `fileUrl()` + `VITE_API_URL` (client + extranet)

---

## IMPORTANT

- <span style="color:#e03e3e">[x]</span> **`GET /files/:id` → 404** si inconnu (+ validation UUID) — `file.controller.ts`
- <span style="color:#e03e3e">[x]</span> **`EditPostPage` `isEditMode`** — `Boolean(postId)` OK
- <span style="color:#e03e3e">[x]</span> **Upload cover `TABLE.POST`** — `EditPostPage.vue` utilise `FILE_TYPE.IMAGE` + `TABLE.POST`
- <span style="color:#e03e3e">[x]</span> **Double cron** — `index.ts` ne boot plus les crons ; `worker.ts` + `#scheduler` seuls
- <span style="color:#e03e3e">[x]</span> **Encyclopédie = toutes les techs** (y compris inactives) — voulu ; `isActive` réservé au **generator** (`fetchActiveTechnologies` / draw)
- <span style="color:#e03e3e">[x]</span> **PBKDF2** — **120_000** itérations + rehash legacy 1000 — `password.utils.ts`
- <span style="color:#e03e3e">[x]</span> **Recherche admin posts** — filtre client sur titre + résumé + auteur + tags (`AdminPostListed` enrichi ; toujours 1× fetch, pas de query à la frappe)
- <span style="color:#e03e3e">[x]</span> **Convention DTO** — garder `*Listed` (élément de liste) + `*Lite` (embed) ; **pas** de rename `Listed` → `Item` (cosmétique, zero gain)
- <span style="color:#e03e3e">[x]</span> **Validation login / register / profile / admin-login** — `ValidateMiddleware` + commons validators
- <span style="color:#e03e3e">[x]</span> **Validators post / comment / user** — en place
- <span style="color:#e03e3e">[x]</span> **Validator `save-technology`** — `validateSaveTechnology` + `ValidateMiddleware` + erreurs champ extranet

---

## MINOR

- <span style="color:#e03e3e">[x]</span> **Routes « orphelines » (check 15/10)** :
  - `DELETE /ws/delete-post` → **utilisé** (EditPostPage corbeille)
  - `GET /fetch-similar-posts/:slug` → **utilisé** (ArticleDetailView)
  - `GET /ws/fetch-tags` → **utilisé** (EditPostPage) ; `GET /fetch-tags` **public** → **orphelins** (aucun front)
  - `GET /ws/fetch-posts-contents` → **orphelin** (ADMIN only, aucun front)
- <span style="color:#e03e3e">[x]</span> **`PublicPostDetail` / date** — `ArticleDetailView` utilise `publishAt` (plus de `createdAt` requis)
- <span style="color:#e03e3e">[x]</span> **Login** — message unique (plus d’énumération email) — `AUTH_FAIL` / `REGISTER_FAIL`
- <span style="color:#e03e3e">[x]</span> **`MODERATOR`** — login admin OK **et** `/ws` autorisé en lecture (posts/users) ; écriture articles refusée (voulu)
- [ ] **CORS `allow-all`** — toujours possible via env ; **pas de garde prod** — `index.ts`
- <span style="color:#e03e3e">[x]</span> **Alias paths (check 15/10)** :
  - `#modules` / `#interfaces` → **morts** (fichiers absents) → retirés du tsconfig ; types = commons, pas de mega-barrel
  - `#blog` était déclaré mais inutilisé → branché (api, web-service, jobs, auth.controller)
  - extranet `#scripts` → **mort** (pas de dossier) → retiré package/tsconfig/vite
- <span style="color:#e03e3e">[x]</span> **`DrawAction` dupliqué / `#action-support`** — disparu
- [ ] **Spec Notion V0** vs stack réelle (Vue + Prisma) — doc

---

## Résolu récemment (ne plus rouvrir)

- <span style="color:#e03e3e">[x]</span> `validateSaveTechnology` + middleware `/ws/save-technology`
- <span style="color:#e03e3e">[x]</span> Recherche admin posts enrichie (auteur + résumé + tags)
- <span style="color:#e03e3e">[x]</span> `POST /upload-file` authentifié + cover `TABLE.POST`
- <span style="color:#e03e3e">[x]</span> Validators auth / post / comment / user + UX field errors / toasts
- <span style="color:#e03e3e">[x]</span> Password confirm register + create user
- <span style="color:#e03e3e">[x]</span> Cursor pointer boutons actifs
- <span style="color:#e03e3e">[x]</span> Consolidation SCSS extranet (form shell) + tokens boutons client
- <span style="color:#e03e3e">[x]</span> Session cookie unique `rs.sid`, rate-limit auth/register/upload
- <span style="color:#e03e3e">[x]</span> Upload MIME allowlist + blocage SVG + sharp
- <span style="color:#e03e3e">[x]</span> `/auth/me` sans `passwordHash`
- <span style="color:#e03e3e">[x]</span> Indexes Prisma utiles : `slug`, `shareCode`, `authorId`, `[status, publishAt]`, `deletedAt`
- <span style="color:#e03e3e">[x]</span> S3 `ObjectStorage` + `GET /files/:id` → 302 signed (code prêt)

---

## Backlog sécu / perf

### P0 — immédiat

- <span style="color:#e03e3e">[x]</span> Auth upload + fix `TABLE.POST` cover

### P1 — sécu API

- [ ] `helmet` (CSP, X-Frame-Options, Referrer-Policy, etc.)
- [ ] `trust proxy` (rate-limit IP derrière Cloudflare/Railway)
- [ ] `express.json({ limit })`
- [ ] Refuse démarrage si `CORS_ALLOW_ALL=true` en production
- <span style="color:#e03e3e">[x]</span> `validateSaveTechnology`
- [ ] Sanitize HTML **serveur** à la save post

### P2 — ops / durcissement

- [ ] Magic bytes upload (valider le buffer avant write)
- [ ] Session store PG (`connect-pg-simple`) + `saveUninitialized: false`
- [ ] CSRF cross-subdomain (si besoin au-delà de `SameSite=lax`)
- [ ] Rate-limit comments / votes / save-post / draw
- [ ] Validation UUID params delete/purge
- [ ] Infra : Bucket Railway + vars `S3_*` + DNS Cloudflare `api` — voir `docs/cloudflare-railway-files.md`

### P3 — perf / hygiene

- [ ] Cache HTTP GET publics + CDN Cloudflare
- [ ] `loading="lazy"` images (presque absent hors AdSlot)
- [ ] Routes Vue lazy (`import()`) — aujourd’hui eager client + extranet
- [ ] `npm audit` / Dependabot CI
- [ ] Revue messages d’erreur API (pas de stack/Prisma en prod)
- [ ] SCSS client — étendre tokens CSS (non urgent)

---

## Écarts vs checklist précédente

| Ancien statut | Verdict code |
|---------------|--------------|
| Upload public | **Auth requise** |
| localhost URLs `[ ]` | **Déjà fixé** via `fileUrl()` |
| getFile 500 / isEditMode / cron / PBKDF2 / login enum / validation login | **Tous OK** |
| Cover `TABLE.POST` | **Corrigé** (`TABLE.POST`) |
| Encyclopédie `isActive` | **By design** — catalogue complet ; filtre actif = generator seulement |
| MODERATOR bloqué sur `/ws` | **Obsolète** — lecture OK maintenant |

---

## Note auth path

Code + extranet : `POST /auth/admin/login` (plus `admin-login`).

## Fichiers liés

- `docs/env-and-cloudflare.md`
- `docs/cloudflare-railway-files.md`
