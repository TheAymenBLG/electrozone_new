# Social → Store Dataset

Turns the ElectroZone social-media scrapes (Apify exports) into one clean knowledge
base, `store_data.json`, that the AI assistant answers from.

## What's here
```
input/                     the 4 raw Apify exports (facebook, instagram, tiktok, google maps)
build_store_data.py        converter (deterministic, invents nothing)
store_data.json            human-readable knowledge base  ← the output
store_data.min.json        minified version (for injecting into a prompt, saves tokens)
```

## How to regenerate (after re-scraping)
1. Re-run your Apify actors, download the JSON exports.
2. Drop them in `input/` (keep the `facebook` / `instagram` / `tiktok` / `google-map`
   words in the filenames — that's how the script finds them).
3. Run:
   ```
   python tools/social-to-dataset/build_store_data.py
   ```

## Where the data comes from
- **Store info** (name, address, phones, hours, rating, socials) → Google Maps export + Instagram bio.
- **Products** → brand + category detected in Facebook / Instagram / TikTok captions
  (bilingual FR/AR). A **price is only added when the post actually states one** — the
  captions rarely do (the store says "visit / DM"), so most products have no price. The
  assistant is told never to invent one.

## How it connects to the app (you already have the bot)
Your backend already has the assistant: `apps/api/src/services/assistantService.ts`.
It builds its knowledge base from **two** places:
1. A `SYSTEM` block with store info (phone, socials, delivery, warranty).
2. The product catalog from the database.

So you do **not** need a separate Python/Mistral bot. Use this dataset to feed the one you have:

**A. Refresh the store info block** — update the `SYSTEM` constant in `assistantService.ts`
with the real values from `store_data.json` → `store` (address in Aïn Smara/Constantine,
second phone `0772 55 72 12`, opening hours, 4.1★ rating).

**B. Load the products** — either seed the extracted products into Postgres (they then flow
into the prompt automatically via `buildCatalog`), or, for a quick demo, append
`store_data.min.json` into the system instruction. Seeding is the clean option because the
rest of the app (storefront, admin) reads the same DB.

Prices/specs stay honest: if a field isn't in the post, it isn't in the dataset, and the
assistant will say it doesn't have that info instead of guessing.
