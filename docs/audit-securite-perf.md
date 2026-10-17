# Audit Randomstack — Sécurité & Perf

> ℹ️ **Source de vérité = le code.**
>
> Branche : `dev_perf_update` · dernière passe : **16 octobre 2026**
>
> Légende : <span style="color:#e03e3e">[x]</span> = fait · `[ ]` = à faire · `N` = idée produit

Le code sécu / perf / dette / bugs polish est **fermé**. Docs infra : `docs/cloudflare-railway-files.md` · `docs/env-and-cloudflare.md`.

---

## Backlog produit (`N`)

### Produit / pages

- [ ] **CLI** `npx create-random-stack` (bootstrap projet dans le terminal)
- [ ] **Multi-langue** : FR / EN / ES / PT / DE

### Monétisation

- [ ] **Affiliation** hébergeurs / formations (Vercel, Supabase, Render, DO, Udemy, OpenClassrooms…)  
  *(pubs / sponsors : déjà branchés via `AdSlot` — à enrichir, pas à recréer)*
- [ ] **Sponsors de tech** émergentes (emplacements dédiés / deals)

### Profil & contenu

- [ ] Profil enrichi : technos connues, préférences, projets, suggestions, mes articles, mes tirages
- [ ] Articles : vidéo / liens vidéo
- [ ] Entrées inbox restantes côté client : signalement article, suggestion article, demande auteur
- [ ] Projets communauté / marque liés aux techs
### Qualité

- [ ] Audit / checkup **API & routes** post-refonte (manuel)
- [ ] Tests unitaires
- [ ] Tests e2e / CI (plus tard)

### Fait (produit)

1. <span style="color:#e03e3e">[x]</span> Page **About** (`/about` — nav + footer)
2. <span style="color:#e03e3e">[x]</span> Catégories encyclopédie : **API**, **CMS**, **Agent IA**, **Librairies**, **ORM** (hors tirage) · **BaaS** tirable comme backend
3. <span style="color:#e03e3e">[x]</span> **Compatibilités** techs (inter-catégories) — ego-graphe fiche + admin + seed Firebase
4. <span style="color:#e03e3e">[x]</span> **Tirage avec cette techno** (fiche → `/draft?with=slug`, couche verrouillée)
5. <span style="color:#e03e3e">[x]</span> **Inbox** générique (rôles) + signalement techno (auth) sur fiche
6. <span style="color:#e03e3e">[x]</span> **Suggestion de techno** (formulaire détaillé → inbox `TECH_SUGGESTION`)

---

## Checklist go-live prod (pas urgent)

Infra / env au lancement — **pas du code**. Déjà dans le code : `trust proxy` (auto en prod) + garde CORS (refuse de démarrer si allow-all en prod).

### À faire — préparer quand tu veux

- [ ] Réserver les domaines `www` / `admin` / `api` (sans pointer les CNAME)
- [ ] Noter les valeurs finales `CLIENT_ORIGIN` / `EXTRANET_ORIGIN`

### À faire — Jour J (Railway + Cloudflare)

- [ ] `NODE_ENV=production` sur le service API Railway
- [ ] CNAME Cloudflare `www` / `admin` / `api` + SSL **Full (strict)**
- [ ] `CORS_ALLOW_ALL=false` + `CLIENT_ORIGIN` / `EXTRANET_ORIGIN` sur Railway
- [ ] Coller `SESSION_SECRET` + vérifier `S3_*` / `DATABASE_URL` sur Railway

### Fait

1. <span style="color:#e03e3e">[x]</span> Générer `SESSION_SECRET` ≥ 32 caractères (coffre / note Railway, jamais git)
2. <span style="color:#e03e3e">[x]</span> Valider upload + `/files/:id` avec les `S3_*` (local Docker → Railway S3, 302 signé OK)
