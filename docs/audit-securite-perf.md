# Audit Randomstack — Sécurité & Perf

> ℹ️ **Source de vérité = le code.**
>
> Branche : `master` · dernière passe : **16 octobre 2026**
>
> Légende : <span style="color:#e03e3e">[x]</span> = fait · `[ ]` = à faire · `N` = idée produit (plus tard)

---

## À faire maintenant

### Go-live prod (ensemble)

1. [ ] `NODE_ENV=production` (Railway)
2. [ ] Domaines Cloudflare `www` / `admin` / `api` + SSL Full (strict)
3. [ ] `CORS_ALLOW_ALL=false` + `CLIENT_ORIGIN` / `EXTRANET_ORIGIN`
4. [ ] `SESSION_SECRET` ≥ 32 caractères
5. [ ] Vérifier Bucket `S3_*` en prod

> Déjà dans le code : `trust proxy` (auto en prod) + garde CORS (refuse de démarrer si allow-all en prod).

### Dette technique restante (ex-To Do / Notion)

6. [ ] **Historique session borné** — `session.history.unshift` puis `.slice(0, 20)` — `stack.controller.ts`
7. [ ] **`generateShortCode` crypto** — `crypto.randomBytes` à la place de `Math.random()`
8. [ ] **Collision `shareCode`** — retry / check unicité avant insert (en plus du unique DB si présent)
9. [ ] **Seed `determineCategories` warn** — `console.warn` si fallback `BACKEND`
10. [ ] **Types session** — `session.d.ts` (`userId`, `userRole`, `history`) — finir le `as any`
11. [ ] **Featured post 1 requête** — fusionner `fetchExplicitFeaturedPost` + `fetchLatestPost` dans `blog.action.ts`

### Bugs / polish (à confirmer encore vivants)

12. [ ] Bug catégories techno à la create/update
13. [ ] Bug share stack technique
14. [ ] Légende cover post (si encore manquante côté UI)

---

## Spec To Do / Notion — déchiffrage

Légende To Do : `L` / `Æ` ≈ fait ou quasi · `N` = backlog produit · `È` = sous-tâche.

### Déjà couvert par le code actuel

| Item To Do | Verdict |
|------------|---------|
| Cookie `secure` en prod | OK |
| `saveUninitialized: false` | OK |
| Session PG + secret env (≥ 32 prod) | OK |
| PBKDF2 (To Do disait 600k ; on a **120k** + rehash legacy — acceptable, bump optionnel) | OK / optionnel |
| Validation body (zod/joi) | OK via commons validators + `ValidateMiddleware` |
| `/me` sans `passwordHash` | OK (mapper) |
| Seed : plus de password en stdout | OK |
| Auth login/register + profile + public profile | OK |
| Articles CRUD + photo + blocs | OK |
| Pages d’erreur 404/403/500 | OK |
| Encyclopédie + slugs + détail techno (desc, versions, histoire, liens…) | OK (plus besoin table `techno_details` séparée) |
| Extranet login + rôles + admin/editor/author/mod | OK |
| Slots locked + blacklist/exclure | OK |
| Generator + ORM layer + share | OK (bugs share à retester) |
| CORS `*` hardcodé | OK (plus dans la whitelist fixe ; allow-all = env only + garde prod) |
| Doublons models/controllers core | OK (structure modules) |
| Ordre articles récent → ancien | OK (indexes + queries) |
| Boolean « actif au tirage » | OK (`isActive`) |

### Backlog produit (`N` — pas urgent)

- Profil enrichi : technos connues, préférences, projets, suggestions, mes articles, mes tirages
- Articles : vidéo / liens vidéo
- Suggestions de technologies
- « ORM / BaaS » (Supabase, Firebase) — réflexion produit, pas une dette sécu
- Projets communauté / marque liés aux techs

### Ignorer / obsolète

- Spec Notion V0 « document d’écart » formel — **cette To Do la remplace** ; pas besoin d’un autre doc Notion
- `BlogAction` double fetch featured — encore ouvert (item #11)
- Tests routes post-refonte — à faire manuellement / plus tard CI e2e

---

## Fait sécu / perf (raccourci)

`trust proxy` · garde CORS prod · helmet · json limit · session PG · sanitize · magic bytes · rate-limits · UUID delete/purge · erreurs API sûres · CSRF N/A · cache GET · lazy routes/images · pages erreur · Dependabot · tokens SCSS · upload auth · etc.

Docs : `docs/cloudflare-railway-files.md` · `docs/env-and-cloudflare.md`
