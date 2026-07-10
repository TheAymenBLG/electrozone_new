import type { Product, Bundle, Offer, SearchResult } from "@electrozone/shared";
import { config } from "../config/env.js";
import { buildCatalogText } from "../lib/catalogText.js";
import { ruleBasedScore } from "../lib/ruleBasedScore.js";

interface Catalog {
  products: Product[];
  bundles: Bundle[];
  offers: Offer[];
}

interface LlmPick {
  id: string;
  score: number;
  reason: string;
}

const SEARCH_PROMPT = `Tu es le moteur de recherche sémantique d'ElectroZone, un magasin d'électroménager en Algérie.
Ta tâche: à partir de la requête en langage naturel de l'utilisateur et de la liste PRODUITS ci-dessous,
classer les produits les plus pertinents.

Règles strictes:
1. Ne retourne QUE des produits dont l'id est présent dans la liste PRODUITS. N'invente jamais d'id.
2. Retourne au maximum 8 résultats, triés du plus pertinent au moins pertinent.
3. Le "score" est un entier de 0 à 100 (100 = correspondance parfaite).
4. La "reason" est une phrase courte (max 15 mots) expliquant pourquoi le produit correspond à la requête.
   Réponds dans la langue de la requête (français/arabe/anglais).
5. Si aucun produit n'est pertinent, retourne un tableau vide [].
6. Réponds UNIQUEMENT avec un tableau JSON valide, aucun texte autour, aucune explication.

Format de réponse attendu:
[{"id":"p1","score":90,"reason":"Correspond car ..."}, ...]`;

const SEARCH_CACHE = new Map<string, { ts: number; results: SearchResult[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX = 64;

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 200);
}

function getCached(key: string): SearchResult[] | null {
  const hit = SEARCH_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    SEARCH_CACHE.delete(key);
    return null;
  }
  return hit.results;
}

function setCached(key: string, results: SearchResult[]): void {
  if (SEARCH_CACHE.size >= CACHE_MAX) {
    const oldest = SEARCH_CACHE.keys().next().value;
    if (oldest) SEARCH_CACHE.delete(oldest);
  }
  SEARCH_CACHE.set(key, { ts: Date.now(), results });
}

function extractJson(raw: string): unknown {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) text = fenceMatch[1].trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return JSON.parse(text);
}

function resolvePicks(
  picks: LlmPick[],
  catalog: Catalog,
): SearchResult[] {
  const byId = new Map(catalog.products.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const out: SearchResult[] = [];
  let dropped = 0;
  for (const pick of picks) {
    if (seen.has(pick.id)) { dropped++; continue; }
    const product = byId.get(pick.id);
    if (!product) { dropped++; continue; }
    if (!product.isActive) { dropped++; continue; }
    seen.add(pick.id);
    out.push({
      product,
      score: Math.max(0, Math.min(100, Math.round(pick.score))),
      reason: String(pick.reason).slice(0, 160),
    });
  }
  console.log(`[search] resolvePicks: ${out.length}/${picks.length} kept, ${dropped} dropped (bad/dup/inactive)`);
  if (dropped > 0) {
    const rejected = picks.filter((p) => !out.some((o) => o.product.id === p.id));
    console.log(`[search] dropped picks:`, JSON.stringify(rejected.map((p) => ({ id: p.id, score: p.score, reason: p.reason }))));
  }
  return out;
}

async function callOllama(query: string, catalogText: string): Promise<LlmPick[]> {
  const base = config.ollamaBaseUrl.replace(/\/api$/, "");
  console.log(`[search] Ollama call → model=${config.ollamaModel}, query="${query}", catalog ${catalogText.length} chars`);
  const t0 = Date.now();
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.ollamaApiKey ? { Authorization: `Bearer ${config.ollamaApiKey}` } : {}),
    },
    body: JSON.stringify({
      model: config.ollamaModel,
      format: "json",
      stream: false,
      options: { temperature: 0.3 },
      messages: [
        { role: "system", content: `${SEARCH_PROMPT}\n\n=== DONNÉES ELECTROZONE ===\n${catalogText}` },
        { role: "user", content: `Requête: "${query}"` },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = await res.json();
  const content = data?.message?.content;
  if (!content) throw new Error("Ollama empty response");
  console.log(`[search] Ollama raw (${Date.now() - t0}ms): ${content.slice(0, 800)}`);
  const parsed = extractJson(content);
  if (!Array.isArray(parsed)) throw new Error("Ollama non-array response");
  console.log(`[search] Ollama parsed ${parsed.length} picks`);
  return parsed as LlmPick[];
}

async function callGemini(query: string, catalogText: string): Promise<LlmPick[]> {
  console.log(`[search] Gemini call → model=${config.geminiModel}, query="${query}", catalog ${catalogText.length} chars`);
  const t0 = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SEARCH_PROMPT}\n\n=== DONNÉES ELECTROZONE ===\n${catalogText}` }] },
        contents: [{ role: "user", parts: [{ text: `Requête: "${query}"` }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini empty response");
  console.log(`[search] Gemini raw (${Date.now() - t0}ms): ${text.slice(0, 800)}`);
  const parsed = extractJson(text);
  if (!Array.isArray(parsed)) throw new Error("Gemini non-array response");
  console.log(`[search] Gemini parsed ${parsed.length} picks`);
  return parsed as LlmPick[];
}

function fallbackRule(query: string, catalog: Catalog): SearchResult[] {
  const scored = ruleBasedScore(query, catalog.products, catalog.offers);
  return scored
    .filter((x) => x.score > 0)
    .slice(0, 8)
    .map((x) => ({
      product: x.product,
      score: Math.min(100, x.score * 15),
      reason: `Correspond par mot-clé: ${query}`,
    }));
}

export async function semanticSearch(query: string, catalog: Catalog): Promise<SearchResult[]> {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const cached = getCached(normalized);
  if (cached) {
    console.log(`[search] query="${normalized}" source=cache results=${cached.length}`);
    return cached;
  }

  const catalogText = buildCatalogText(catalog.products, catalog.bundles, catalog.offers);
  let source = "unknown";

  let results: SearchResult[] = [];

  try {
    const picks = await callOllama(normalized, catalogText);
    results = resolvePicks(picks, catalog);
    if (results.length > 0) {
      source = "ollama";
      setCached(normalized, results);
      console.log(`[search] query="${normalized}" source=ollama results=${results.length}`);
      return results;
    }
    console.log(`[search] Ollama returned 0 usable results, trying next tier`);
  } catch (e) {
    console.warn("[search] Ollama failed, trying Gemini:", e instanceof Error ? e.message : e);
  }

  if (config.geminiApiKey) {
    try {
      const picks = await callGemini(normalized, catalogText);
      results = resolvePicks(picks, catalog);
      if (results.length > 0) {
        source = "gemini";
        setCached(normalized, results);
        console.log(`[search] query="${normalized}" source=gemini results=${results.length}`);
        return results;
      }
      console.log(`[search] Gemini returned 0 usable results, trying rule fallback`);
    } catch (e) {
      console.warn("[search] Gemini failed, using rule fallback:", e instanceof Error ? e.message : e);
    }
  }

  results = fallbackRule(normalized, catalog);
  source = "rule";
  setCached(normalized, results);
  console.log(`[search] query="${normalized}" source=rule results=${results.length}`);
  return results;
}