import type { Product, Bundle, Offer, ChatMessage } from "@electrozone/shared";
import { config } from "../config/env.js";

function formatDA(amount: number): string {
  return new Intl.NumberFormat("fr-DZ").format(Math.round(amount)) + " DA";
}

function isLive(o: Offer): boolean {
  if (!o.isActive) return false;
  const now = new Date().toISOString().slice(0, 10);
  return o.startsAt <= now && o.endsAt >= now;
}

function priceProduct(product: Product, offers: Offer[]) {
  const matching = offers.filter((o) => {
    if (!isLive(o)) return false;
    if (o.scope === "sitewide") return true;
    if (o.scope === "product") return o.targetId === product.id;
    if (o.scope === "category") return o.targetId === product.categorySlug;
    return false;
  });
  let best = { finalPrice: product.price, originalPrice: product.price, discountPct: 0 };
  for (const o of matching) {
    const final =
      o.type === "percentage"
        ? product.price * (1 - o.value / 100)
        : Math.max(0, product.price - o.value);
    if (final < best.finalPrice) {
      best = {
        finalPrice: Math.round(final),
        originalPrice: product.price,
        discountPct: Math.round((1 - final / product.price) * 100),
      };
    }
  }
  return best;
}

function bundleFinalPrice(bundle: Bundle, products: Product[]): number {
  const total = bundle.items.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.productId);
    return sum + (p ? p.price * it.quantity : 0);
  }, 0);
  return bundle.bundlePrice ?? total;
}

function buildCatalog(products: Product[], bundles: Bundle[], offers: Offer[]): string {
  const lines: string[] = [];
  lines.push("PRODUITS:");
  for (const p of products.filter((x) => x.isActive)) {
    const pr = priceProduct(p, offers);
    const price =
      pr.discountPct > 0
        ? `${formatDA(pr.finalPrice)} (au lieu de ${formatDA(pr.originalPrice)}, -${pr.discountPct}%)`
        : formatDA(p.price);
    const specs = Object.entries(p.specs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    lines.push(
      `- ${p.name} | marque ${p.brand} | catégorie ${p.categorySlug} | prix ${price} | stock ${p.stock} | specs: ${specs} | description: ${p.description || "(aucune)"}`,
    );
  }
  lines.push("\nPACKS:");
  for (const b of bundles.filter((x) => x.isActive)) {
    lines.push(`- ${b.name} | prix ${formatDA(bundleFinalPrice(b, products))} | ${b.description}`);
  }
  return lines.join("\n");
}

/* Match a specific product the user is asking about (by brand + name tokens). */
function findProductMatch(text: string, products: Product[]): Product | null {
  const t = " " + text.toLowerCase() + " ";
  let best: Product | null = null;
  let bestScore = 0;
  for (const p of products) {
    let score = 0;
    if (t.includes(p.brand.toLowerCase())) score += 2;
    const tokens = p.name
      .toLowerCase()
      .split(/[^a-z0-9à-ÿ]+/)
      .filter((w: string) => w.length >= 3 && w !== p.brand.toLowerCase());
    for (const tok of tokens) if (t.includes(tok)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  // Need a strong, specific match (brand + a model word, or several name words).
  return bestScore >= 3 ? best : null;
}

function describeProduct(p: Product, offers: Offer[]): string {
  const pr = priceProduct(p, offers);
  const price =
    pr.discountPct > 0
      ? `${formatDA(pr.finalPrice)} (au lieu de ${formatDA(pr.originalPrice)}, -${pr.discountPct}%)`
      : formatDA(p.price);
  const specs = Object.entries(p.specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  const desc = p.description?.trim() || "Pas de description disponible pour ce produit.";
  const stock = p.stock > 0 ? `En stock (${p.stock})` : "Rupture de stock";
  const specLine = specs ? `\n${specs}` : "";
  return `${p.name} — ${price}\n${desc}${specLine}\n${stock}. Voulez-vous le commander (paiement à la livraison) ?`;
}

const SYSTEM = `Tu es l'assistant d'achat d'ElectroZone, un magasin d'électroménager à Constantine, Algérie (prix en DA).

=== INFOS MAGASIN ===
Nom: ElectroZone électroménager
Adresse: Haricha Ammar, Aïn Smara, Constantine, Algérie (Plus Code 7F7M+F3)
Téléphone: 0554 57 66 64 / 0772 55 72 12
Horaires: Samedi à Jeudi 09:00–18:00, Vendredi 15:00–18:00
Note Google: 4,1/5 (16 avis)
Facebook: https://www.facebook.com/electrozone25/
Instagram: https://www.instagram.com/electrozone.constantine/
TikTok: https://www.tiktok.com/@electrozone.const
Livraison: 58 wilayas, paiement à la livraison.
Garantie: selon la marque du produit (jusqu'à 10 ans sur certains compresseurs/moteurs).
Engagement: Produits 100% originaux.

Règles strictes:
1. Réponds UNIQUEMENT à partir des INFOS MAGASIN et de la liste PRODUITS/PACKS fournie ci-dessous. C'est ta seule source.
2. DESCRIPTION D'UN PRODUIT : quand un client demande des infos/détails sur un produit, donne UNIQUEMENT la « description » fournie dans les données pour ce produit (plus son prix, ses specs et son stock). N'invente rien et n'ajoute aucune information extérieure. Si la description est vide, dis-le et propose d'appeler le magasin.
3. N'invente jamais de produit, de prix, de caractéristique, de réduction ou de délai. Cite les prix en DA depuis les données.
4. Si l'info n'est pas dans ces données, dis poliment que tu peux seulement aider avec les produits et services ElectroZone.
5. Si l'utilisateur demande comment suivre/contacter le magasin, donne les liens exacts ci-dessus.
6. Si l'utilisateur donne un budget, ne recommande que des produits à ce prix ou en dessous, du plus adapté au moins adapté. Si rien ne rentre, dis-le et propose l'option la plus proche ou un pack.
7. Sois concis, chaleureux, et guide vers un choix concret. Réponds dans la langue de l'utilisateur (français/arabe/anglais).`;

function ruleBasedReply(
  msg: string,
  catalog: { products: Product[]; bundles: Bundle[]; offers: Offer[] },
): string {
  const text = msg.toLowerCase().trim();
  const t = " " + text + " ";
  const active = catalog.products.filter((p) => p.isActive);

  // 1) Specific product asked about -> give the admin description.
  const matched = findProductMatch(msg, active);
  if (matched) return describeProduct(matched, catalog.offers);

  // 2) Detect a budget and score products by relevance.
  const budgetMatch = text.replace(/\s/g, "").match(/(\d{4,7})/);
  const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  const scored = active
    .map((p) => {
      const pr = priceProduct(p, catalog.offers);
      let score = 0;
      if (text.includes(p.categorySlug.replace(/-/g, " "))) score += 3;
      if (text.includes(p.brand.toLowerCase())) score += 2;
      for (const w of ["café", "cafe", "frigo", "réfrigérateur", "refrigerateur", "laver", "lave", "tv", "télé", "tele", "aspirateur", "micro", "clim", "congel"]) {
        if (text.includes(w) && (p.name.toLowerCase().includes(w) || p.categorySlug.includes(w.slice(0, 4)))) score += 2;
      }
      return { p, price: pr.finalPrice, score };
    })
    .sort((a, b) => b.score - a.score || a.price - b.price);

  const hasSignal = budget !== null || scored.some((x) => x.score > 0);

  // 3) Small talk when there's no product intent.
  if (!hasSignal) {
    const greet = ["slm", "salam", "salem", "aslema", "ahlan", "ahla", "sbah", "msa", "bonjour", "bonsoir", "salut", "coucou", " cc ", " hello ", " hi ", " hey ", " yo ", " hola ", "kifach", "labas", "wach", "cava", "ça va"];
    const thanks = ["merci", "choukran", "chokran", "thank", "yaatik", "sahit"];
    if (thanks.some((g) => t.includes(g)))
      return "Avec plaisir ! 😊 Dites-moi ce que vous cherchez (un produit, une marque ou votre budget en DA) et je vous guide.";
    if (greet.some((g) => t.includes(g)))
      return "Bonjour et bienvenue chez ElectroZone ! 👋 Que recherchez-vous aujourd'hui ? Donnez-moi un type de produit, une marque, ou votre budget en DA — ou utilisez les boutons ci-dessus.";
    return "Je peux vous aider à choisir parmi les produits ElectroZone (électroménager). Dites-moi ce que vous cherchez et votre budget en DA, ou utilisez les boutons ci-dessus.";
  }

  // 4) There is intent -> recommend.
  const pool = budget ? scored.filter((x) => x.price <= budget) : scored.filter((x) => x.score > 0);

  if (pool.length === 0) {
    if (budget) {
      const cheapest = active
        .map((p) => ({ p, price: priceProduct(p, catalog.offers).finalPrice }))
        .sort((a, b) => a.price - b.price)[0];
      return `Aucun produit ne rentre dans ${formatDA(budget)}. Le moins cher est ${cheapest.p.name} à ${formatDA(cheapest.price)}. Souhaitez-vous augmenter un peu le budget ?`;
    }
    return "Je n'ai pas trouvé de correspondance. Précisez un produit, une marque ou un budget.";
  }

  const top = pool.slice(0, 3);
  const intro = budget
    ? `Voici ce que je recommande pour un budget de ${formatDA(budget)} :`
    : "Voici quelques suggestions :";
  const list = top.map((x) => `• ${x.p.name} — ${formatDA(x.price)}`).join("\n");
  return `${intro}\n${list}\n\nVoulez-vous plus de détails sur l'un d'eux ?`;
}

export async function askAssistant(
  history: ChatMessage[],
  userMessage: string,
  catalog: { products: Product[]; bundles: Bundle[]; offers: Offer[] },
): Promise<string> {
  if (!config.geminiApiKey) {
    return ruleBasedReply(userMessage, catalog);
  }
  try {
    const catalogText = buildCatalog(catalog.products, catalog.bundles, catalog.offers);
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
          generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || ruleBasedReply(userMessage, catalog);
  } catch (e) {
    console.warn("Gemini call failed, using fallback:", e);
    return ruleBasedReply(userMessage, catalog);
  }
}
