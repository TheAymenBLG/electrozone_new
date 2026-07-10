import type { Product, Offer } from "@electrozone/shared";
import { priceProduct } from "./catalogText.js";

export interface ScoredProduct {
  product: Product;
  finalPrice: number;
  score: number;
}

const KEYWORDS = [
  "café", "cafe", "frigo", "réfrigérateur", "refrigerateur", "laver", "tv", "télé",
  "tele", "aspirateur", "micro", "four", "cuisinière", "cuisiniere", "lave-vaisselle",
  "congélateur", "congelateur", "balai", "tapis", "sond", "mousse", "sans fil", "expresso",
  "capsule", "4k", "android", "robot", "pétrin", "petrin",
];

export function ruleBasedScore(
  query: string,
  products: Product[],
  offers: Offer[],
): ScoredProduct[] {
  const text = query.toLowerCase();
  const budgetMatch = text.replace(/\s/g, "").match(/(\d{4,7})/);
  const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  return products
    .filter((p) => p.isActive)
    .map((p) => {
      const pr = priceProduct(p, offers);
      let score = 0;
      if (text.includes(p.categorySlug.replace(/-/g, " "))) score += 3;
      if (text.includes(p.brand.toLowerCase())) score += 2;
      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();
      for (const w of KEYWORDS) {
        if (text.includes(w) && (name.includes(w) || desc.includes(w) || p.categorySlug.includes(w.slice(0, 4)))) {
          score += 2;
        }
      }
      const queryTokens = text.split(/\s+/).filter((t) => t.length > 2);
      for (const t of queryTokens) {
        if (name.includes(t)) score += 1;
      }
      return { product: p, finalPrice: pr.finalPrice, score };
    })
    .filter((x) => (budget ? x.finalPrice <= budget : true))
    .sort((a, b) => b.score - a.score || a.finalPrice - b.finalPrice);
}