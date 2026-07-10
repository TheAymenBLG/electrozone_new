import type { Review } from "@electrozone/shared";

function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

const AUTHORS = [
  "Yacine B.", "Amina C.", "Karim H.", "Sara B.", "Mohamed L.",
  "Nour K.", "Riad M.", "Lina S.", "Bilal F.", "Imene O.",
  "Sofiane B.", "Yasmine K.", "Adel D.", "Farida N.", "Rachid A.",
];

const TITLES_POS = [
  "Très bon produit", "Excellent rapport qualité/prix", "Je recommande",
  "Conforme à la description", "Bonne machine", "Satisfait de mon achat",
  "Top qualité", "Ne regrette pas", "Parfait pour l'usage quotidien",
];

const TITLES_NEU = [
  "Correct mais...", "Bon dans l'ensemble", "Quelques défauts",
  "Mitigé", "Fait le travail",
];

const TITLES_NEG = [
  "Déçu", "Pas ce que j'attendais", "Qualité moyenne",
];

const COMMENTS_POS = [
  "Livraison rapide et produit conforme. Tout fonctionne parfaitement après 2 semaines d'utilisation.",
  "Bonne qualité de fabrication. Le rapport prix/performance est excellent pour cette gamme.",
  "Je l'utilise tous les jours, très satisfait. Facile à prendre en main.",
  "Exactement ce que je cherchais. Solide et bien fini.",
  "Excellente machine pour le prix. Je recommande vivement.",
  "Aucun souci depuis l'achat, très content de mon choix.",
  "Bonne puissance, silencieux, parfait pour mon foyer.",
];

const COMMENTS_NEU = [
  "Le produit est correct mais l'emballage était abîmé à la réception. Sinon tout va bien.",
  "Bon dans l'ensemble, quelques petits détails à améliorer mais rien de grave.",
  "Fait le travail, pas de surprise. J'aurais aimé un manuel plus détaillé.",
  "Correct pour le prix. On verra sur la durée.",
];

const COMMENTS_NEG = [
  "Le produit a cessé de fonctionner après quelques jours. SAV à voir.",
  "Qualité en dessous de mes attentes pour ce prix-là.",
  "Bruit plus important que prévu, sinon les fonctions de base marchent.",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function getMockReviews(productId: string): Review[] {
  const h = hash(productId);
  const count = 2 + (h % 4);
  const avgBase = 3 + (h % 3);
  const reviews: Review[] = [];

  for (let i = 0; i < count; i++) {
    const seed = hash(productId + "-r" + i);
    const ratingNoise = i === 0 ? 0 : (seed % 3) - 1;
    const rating = Math.max(1, Math.min(5, avgBase + ratingNoise));
    const isPos = rating >= 4;
    const isNeu = rating === 3;
    const title = isPos
      ? pick(TITLES_POS, seed)
      : isNeu
        ? pick(TITLES_NEU, seed)
        : pick(TITLES_NEG, seed);
    const comment = isPos
      ? pick(COMMENTS_POS, seed)
      : isNeu
        ? pick(COMMENTS_NEU, seed)
        : pick(COMMENTS_NEG, seed);
    const daysAgo = 5 + (seed % 180);
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

    reviews.push({
      id: `${productId}-r${i}`,
      productId,
      author: pick(AUTHORS, seed),
      rating,
      date,
      title,
      comment,
    });
  }

  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}

export function getRatingSummary(reviews: Review[]): { avg: number; count: number } {
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}