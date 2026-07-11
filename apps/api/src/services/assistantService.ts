import type { Product, Bundle, Offer, ChatMessage } from "@electrozone/shared";
import { config } from "../config/env.js";
import { buildCatalogText, priceProduct } from "../lib/catalogText.js";
import { ruleBasedScore } from "../lib/ruleBasedScore.js";

function formatDA(amount: number): string {
  return new Intl.NumberFormat("fr-DZ").format(Math.round(amount)) + " DA";
}

const SYSTEM = `Tu es l'assistant d'achat d'ElectroZone, un magasin d'électroménager en Algérie (prix en DA).
Règles strictes:
1. Réponds UNIQUEMENT à partir de la liste PRODUITS/PACKS fournie ci-dessous. C'est ta seule source.
2. Si l'info n'est pas dans ces données, dis poliment que tu peux seulement aider avec les produits ElectroZone.
3. N'invente jamais de produit, de prix ou de caractéristique. Cite toujours les prix en DA depuis les données.
4. Si l'utilisateur donne un budget, ne recommande que des produits à ce prix ou en dessous, du plus adapté au moins adapté. Si rien ne rentre, dis-le et propose l'option la plus proche ou un pack.
5. Sois concis, chaleureux, et guide vers un choix concret. Réponds dans la langue de l'utilisateur (français/arabe/anglais).`;

function ruleBasedReply(
  msg: string,
  catalog: { products: Product[]; bundles: Bundle[]; offers: Offer[] },
): string {
  const text = msg.toLowerCase();
  const budgetMatch = text.replace(/\s/g, "").match(/(\d{4,7})/);
  const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  const scored = ruleBasedScore(msg, catalog.products, catalog.offers);

  if (scored.length === 0 || scored[0].score === 0) {
    if (budget) {
      const active = catalog.products.filter((p) => p.isActive);
      const cheapest = active
        .map((p) => ({ p, price: priceProduct(p, catalog.offers).finalPrice }))
        .sort((a, b) => a.price - b.price)[0];
      if (cheapest) {
        return `Aucun produit ne rentre dans ${formatDA(budget)}. Le moins cher est ${cheapest.p.name} à ${formatDA(cheapest.price)}. Souhaitez-vous augmenter un peu le budget ?`;
      }
    }
    return "Je peux vous aider à choisir parmi les produits ElectroZone (électroménager). Dites-moi ce que vous cherchez et votre budget en DA.";
  }

  const top = scored.slice(0, 3);
  const intro = budget
    ? `Voici ce que je recommande pour un budget de ${formatDA(budget)} :`
    : "Voici quelques suggestions :";
  const list = top.map((x) => `• ${x.product.name} — ${formatDA(x.finalPrice)}`).join("\n");
  return `${intro}\n${list}\n\nVoulez-vous plus de détails sur l'un d'eux ?`;
}

async function callOllama(
  history: ChatMessage[],
  userMessage: string,
  catalogText: string,
): Promise<string> {
  const base = config.ollamaBaseUrl.replace(/\/api$/, "");
  const messages = [
    { role: "system", content: `${SYSTEM}\n\n=== DONNÉES ELECTROZONE ===\n${catalogText}` },
    ...history.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.ollamaApiKey ? { Authorization: `Bearer ${config.ollamaApiKey}` } : {}),
    },
    body: JSON.stringify({
      model: config.ollamaModel,
      stream: false,
      options: { temperature: 0.4 },
      messages,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const data = await res.json();
  const content = data?.message?.content;
  if (!content) throw new Error("Ollama empty response");
  return content;
}

async function callGemini(
  history: ChatMessage[],
  userMessage: string,
  catalogText: string,
): Promise<string> {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM}\n\n=== DONNÉES ELECTROZONE ===\n${catalogText}` }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini empty response");
  return text;
}

export async function askAssistant(
  history: ChatMessage[],
  userMessage: string,
  catalog: { products: Product[]; bundles: Bundle[]; offers: Offer[] },
): Promise<string> {
  const catalogText = buildCatalogText(catalog.products, catalog.bundles, catalog.offers);

  try {
    return await callOllama(history, userMessage, catalogText);
  } catch (e) {
    console.warn("[assistant] Ollama failed, trying Gemini:", e instanceof Error ? e.message : e);
  }

  if (config.geminiApiKey) {
    try {
      return await callGemini(history, userMessage, catalogText);
    } catch (e) {
      console.warn("[assistant] Gemini failed, using rule-based:", e instanceof Error ? e.message : e);
    }
  }

  return ruleBasedReply(userMessage, catalog);
}