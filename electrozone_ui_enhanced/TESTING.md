# ElectroZone — Testing Guide

How to run the app and test everything: the AI chatbot, the storefront, and the admin dashboard.

---

## 0. What you need running
Three things must be up, in this order:
1. **PostgreSQL** (Docker container)
2. **API server** (port 4000)
3. **Web server** (port 5173)

---

## 1. Start everything

Open a terminal in the project root (`electrozone_new`).

**a) Database** — start the existing container (create it only the first time):
```
docker start electrozone-db
```
Check it is running (you should see it with 0.0.0.0:5432->5432):
```
docker ps
```

**b) Create tables + load demo data** (only needed the first time, or after a reset):
```
npm run db:push
npm run db:seed
```
`db:seed` must finish with no red errors. It loads 9 categories, 16 products, bundles.

**c) API server** — leave this terminal open:
```
npm run dev:api
```
Wait for: `[api] listening on http://localhost:4000`

**d) Web server** — open a SECOND terminal:
```
npm run dev:web
```
Wait for: `Local: http://localhost:5173/` then open that URL.

---

## 2. Verify the backend is alive (30-second sanity check)

In a third terminal:
```
curl http://localhost:4000/health
curl http://localhost:4000/api/catalog
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"password\":\"admin\"}"
```
Expected:
- `/health` -> `{"ok":true}`
- `/api/catalog` -> big JSON with products/categories/bundles
- login -> `{"token":"..."}`

If any of these fail, the site can't work yet — fix this before testing the UI (see Troubleshooting).

---

## 3. Test the storefront + images

Open **http://localhost:5173**.
- [ ] Home page shows the hero, categories, products, and the scrolling brand marquee.
- [ ] Product images show (not broken icons). Direct check: open **http://localhost:5173/img/fridge.png** — it must display.
- [ ] Click a category, then a product — the product page opens.
- [ ] Add to cart -> the cart count (top right) goes up.

Note: 2 seeded products (a washing machine and a microwave) use online images and need internet. Everything else is local.

---

## 4. Test the AI chatbot (the assistant you built)

Click the **gold round chat button**, bottom-right of the storefront.

**Suggestions (quick-reply chips) — work with no API key:**
- [ ] On open you see a greeting + chips: *Par budget · Par marque · Par catégorie · Voir les packs*.
- [ ] Click **Par budget** -> price ranges appear -> click one -> up to 3 product cards (image, brand, price).
- [ ] Click **Par marque** -> brand chips -> click one -> matching products.
- [ ] Click **Par catégorie** -> category chips -> click one -> matching products.
- [ ] Click **Voir les packs** -> your bundles are listed.
- [ ] Click a product card -> it opens that product page.
- [ ] Click the reset icon (top-right of the chat) -> conversation restarts.

**Free text (typed messages):**
- [ ] Type `frigo pour 130000 DA` and send -> you get a written recommendation.
- [ ] Type something off-topic like `raconte une blague` -> it politely refuses (only helps with the store).

Without a Gemini key, typed answers use the built-in rule-based bot. To test the smarter AI:
add `GEMINI_API_KEY=your_key` in `apps/api/.env`, restart `npm run dev:api`, then type
`quelle est votre adresse ?` -> it answers with the real Aïn Smara address + phones.

---

## 5. Test the admin dashboard

Open **http://localhost:5173/admin**.
- [ ] A login screen appears. Enter password **`admin`** -> Se connecter -> the dashboard opens.
  (If it says "Connexion impossible…", the API isn't running — see step 1c.)

**Products (add / edit / delete):**
- [ ] Products page -> "Ajouter un produit" -> fill name, brand, category, price, stock -> save.
- [ ] The new product appears in the list AND on the storefront (refresh home).
- [ ] Edit it (pencil), change the price -> save -> price updates.
- [ ] Delete it (trash) -> confirm -> it disappears.

**Packs (bundle of existing products):**
- [ ] Packs page -> create a pack, add 2+ existing products, set a bundle price -> save.
- [ ] The pack shows in the assistant's "Voir les packs" and on the storefront.

**Offers (discounts on existing products):**
- [ ] Offres page -> add an offer (e.g. 15% on one product or a category) -> save.
- [ ] Open that product -> the discounted price shows.

**Logout:** the "Quitter" button (bottom-left of the sidebar) logs you out.

Note: the **Commandes, Clients, Analytiques** pages currently show demo/sample data,
not live database records. They render but are not wired to real orders yet.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Login says "Connexion impossible…" | API not running | Start `npm run dev:api`, wait for the listening line |
| Login says "Mot de passe incorrect" | wrong password | Use `admin` (lowercase, no spaces) |
| `db:seed` "Can't reach database server" | Postgres not up | `docker start electrozone-db`, then retry |
| Chat shows "catalogue en cours de chargement" | empty catalog / API down | run `db:seed`; check `dev:api` terminal |
| Product images broken | catalog not seeded, or offline for the 2 online images | run `db:seed`; check `/img/fridge.png` loads |
| API terminal crashes on start | DB connection failed | make sure Docker DB is running |

---

## Passwords / defaults
- Admin password: **admin** (set in `apps/api/.env` -> `ADMIN_PASSWORD`)
- API: http://localhost:4000  ·  Web: http://localhost:5173
- DB: postgres/postgres on localhost:5432, database `electrozone`
