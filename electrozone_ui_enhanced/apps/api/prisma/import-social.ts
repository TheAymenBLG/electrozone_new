import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

// Must match the slugs in prisma/seed.ts
const VALID_CATEGORY_SLUGS = [
  "refrigerateur",
  "congelateur",
  "machine-a-laver",
  "lave-vaisselle",
  "cuisiniere",
  "micro-onde",
  "machine-a-cafe",
  "tv",
  "aspirateur",
];

interface RawPost {
  caption?: string;
  text?: string;
  description?: string;
  message?: string;
  imageUrl?: string;
  displayUrl?: string;
  url?: string;
  timestamp?: string;
}

interface ExtractedProduct {
  name: string;
  brand: string;
  categorySlug: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  specs: Record<string, string>;
  isActive: boolean;
}

function extractCaptions(posts: RawPost[]): { caption: string; imageUrl: string }[] {
  const out: { caption: string; imageUrl: string }[] = [];
  for (const p of posts) {
    const caption = p.caption ?? p.text ?? p.description ?? p.message ?? "";
    if (!caption.trim()) continue;
    out.push({ caption, imageUrl: p.imageUrl ?? p.displayUrl ?? "" });
  }
  return out;
}

async function extractProductsFromCaption(
  caption: string,
  imageUrl: string,
): Promise<ExtractedProduct[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in apps/api/.env");
  }

  const prompt = `Tu es un extracteur de données pour un magasin d'électroménager en Algérie.
À partir du texte d'un post réseaux sociaux, extrais TOUS les produits mentionnés dans un tableau JSON valide.

RÈGLES:
- "price" est un nombre entier en Dinar Algérien (DA). Si le prix n'est pas mentionné, mets 0.
- "categorySlug" DOIT être l'une de ces valeurs exactes: ${VALID_CATEGORY_SLUGS.join(", ")}. Si le produit ne correspond à aucune catégorie, utilise "aspirateur" comme fallback.
- "brand" est la marque (Condor, Bosch, Delonghi, LG, Samsung, etc.). Si inconnu, mets "Générique".
- "specs" est un objet clé-valeur avec les caractéristiques techniques trouvées (ex: {"capacite":"470L","technologie":"No Frost"}). Objet vide si rien.
- "description" est un résumé propre du produit (sans emojis, sans prix, sans texte marketing).
- "imageUrl" est "${imageUrl}".
- "stock" est 5 par défaut.
- "isActive" est true.
- Ne retourne QUE le JSON, aucun texte autour.

Texte du post:
${caption}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.0, maxOutputTokens: 1000 },
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];

  // Extract JSON array from response (handles ```json fences)
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]) as ExtractedProduct[];
}

async function importSocialData(filepath: string) {
  const absPath = resolve(filepath);
  console.log(`Loading Apify export from: ${absPath}`);

  const raw = JSON.parse(readFileSync(absPath, "utf-8")) as RawPost[] | { posts: RawPost[] };
  const posts = Array.isArray(raw) ? raw : raw.posts ?? [];
  console.log(`Found ${posts.length} posts.`);

  const captions = extractCaptions(posts);
  console.log(`${captions.length} posts have captions. Processing with Gemini...\n`);

  const allProducts: ExtractedProduct[] = [];
  let processed = 0;

  for (const { caption, imageUrl } of captions) {
    try {
      const products = await extractProductsFromCaption(caption, imageUrl);
      allProducts.push(...products);
      processed++;
      console.log(`[${processed}/${captions.length}] Extracted ${products.length} product(s) from post`);
    } catch (e) {
      console.warn(`[${processed + 1}/${captions.length}] Failed:`, e instanceof Error ? e.message : e);
    }
  }

  if (allProducts.length === 0) {
    console.log("\nNo products could be extracted. Check that your posts contain product info.");
    return;
  }

  // Deduplicate by name (keep highest price / first occurrence)
  const seen = new Map<string, ExtractedProduct>();
  for (const p of allProducts) {
    const key = p.name.toLowerCase().trim();
    if (!seen.has(key)) seen.set(key, p);
  }
  const unique = [...seen.values()];

  console.log(`\nTotal extracted: ${allProducts.length} → ${unique.length} unique products.`);
  console.log("Inserting into database...\n");

  let inserted = 0;
  for (const p of unique) {
    // Ensure category exists (create if missing)
    const cat = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!cat) {
      console.warn(`  Skipping "${p.name}" — category "${p.categorySlug}" does not exist. Run db:seed first.`);
      continue;
    }

    // Upsert by name (update price if product already exists)
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          price: p.price || existing.price,
          stock: p.stock,
          description: p.description || existing.description,
          imageUrl: p.imageUrl || existing.imageUrl,
          specs: p.specs as any,
          isActive: true,
        },
      });
      console.log(`  Updated: ${p.name} — ${p.price} DA`);
    } else {
      await prisma.product.create({
        data: {
          name: p.name,
          brand: p.brand,
          categorySlug: p.categorySlug,
          price: p.price,
          stock: p.stock,
          description: p.description,
          imageUrl: p.imageUrl,
          specs: p.specs as any,
          isActive: true,
        },
      });
      console.log(`  Created: ${p.name} — ${p.price} DA [${p.categorySlug}]`);
    }
    inserted++;
  }

  console.log(`\nDone. ${inserted} products imported from social media.`);
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx prisma/import-social.ts <path-to-apify-export.json>");
  process.exit(1);
}

importSocialData(file)
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });