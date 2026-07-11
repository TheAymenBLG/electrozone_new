import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { id: "c1", name: "Réfrigérateur", slug: "refrigerateur" },
  { id: "c2", name: "Congélateur", slug: "congelateur" },
  { id: "c3", name: "Machine à laver", slug: "machine-a-laver" },
  { id: "c4", name: "Lave-vaisselle", slug: "lave-vaisselle" },
  { id: "c5", name: "Cuisinière", slug: "cuisiniere" },
  { id: "c6", name: "Micro-onde", slug: "micro-onde" },
  { id: "c7", name: "Machine à café", slug: "machine-a-cafe" },
  { id: "c8", name: "Téléviseur", slug: "tv" },
  { id: "c9", name: "Aspirateur", slug: "aspirateur" },
];

const washerImg = "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=60";
const microImg = "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=60";

const products = [
  { id: "p1", name: "Bissell Crosswave C3 Select", brand: "Bissell", categorySlug: "aspirateur", price: 54900, stock: 8, description: "L'aspirateur à eau CrossWave C3 Select aspire, lave et sèche vos sols simultanément. Technologie BISSELL FreshStart pour éliminer les odeurs, double réservoir amovible (eau propre 0,82 L / eau usée 0,62 L).", imageUrl: "/img/vacuum-bissell-crosswave.png", specs: { type: "Balai laveur", puissance: "560 W", brosse: "3500 tr/min", technologie: "FreshStart", largeur: "30", hauteur: "112", profondeur: "28" }, isActive: true },
  { id: "p2", name: "BISSELL CrossWave HF3 Sans Fil", brand: "Bissell", categorySlug: "aspirateur", price: 69900, stock: 5, description: "Aspirateur balai laveur sans fil : aspire et lave en un seul passage. Léger, maniable, autonomie prolongée pour toute la maison.", imageUrl: "/img/vacuum-bissell-stick.png", specs: { type: "Balai laveur", alimentation: "Sans fil", usage: "Multi-surfaces", largeur: "26", hauteur: "118", profondeur: "25" }, isActive: true },
  { id: "p3", name: "Bissell SpotClean Pro 1558N", brand: "Bissell", categorySlug: "aspirateur", price: 65500, stock: 4, description: "Injecteur/extracteur portable pour venir à bout des taches tenaces sur tapis, moquettes et tissus d'ameublement.", imageUrl: "/img/vacuum-bissell-spotclean.png", specs: { type: "Injecteur/Extracteur", cuve: "3,7 L", puissance: "750 W", largeur: "34", hauteur: "45", profondeur: "30" }, isActive: true },
  { id: "p4", name: "Bomann 4en1 ES1190CB", brand: "Bomann", categorySlug: "machine-a-cafe", price: 23500, stock: 12, description: "Cafetière expresso multi-capsules 4-en-1 : compatible café moulu, capsules Nespresso, Dolce Gusto et dosettes ESE 44 mm. Compacte, idéale pour petites cuisines ou bureaux.", imageUrl: "/img/coffee-bomann-19bars.png", specs: { sku: "ES1190CB", puissance: "1450 W", pression: "19 bars", reservoir: "0,8 L amovible", largeur: "15", hauteur: "24", profondeur: "22" }, isActive: true },
  { id: "p5", name: "Bomann 4en1 Espresso", brand: "Bomann", categorySlug: "machine-a-cafe", price: 27500, stock: 9, description: "Expresso 4-en-1 : poudre, capsules et dosettes, avec buse vapeur pour un lait bien mousseux.", imageUrl: "/img/coffee-bomann-1450.png", specs: { type: "Expresso", pression: "19 bars", buse: "Vapeur", largeur: "18", hauteur: "28", profondeur: "24" }, isActive: true },
  { id: "p6", name: "Bomann 4en1 Injecteur/Extracteur", brand: "Bomann", categorySlug: "aspirateur", price: 46500, stock: 6, description: "Injecteur/extracteur 4-en-1 pour un nettoyage en profondeur des sols, tapis et tissus.", imageUrl: "/img/shark-vacuum.png", specs: { type: "Injecteur/Extracteur", usage: "Tapis & tissus", largeur: "32", hauteur: "40", profondeur: "28" }, isActive: true },
  { id: "p7", name: "BOSCH Aqua Wash Clean Serie 4", brand: "Bosch", categorySlug: "aspirateur", price: 89900, stock: 3, description: "Injecteur/extracteur haut de gamme Bosch Serie 4 pour un nettoyage en profondeur et un séchage rapide.", imageUrl: "/img/vacuum-bosch.png", specs: { type: "Injecteur/Extracteur", serie: "Serie 4", largeur: "35", hauteur: "50", profondeur: "34" }, isActive: true },
  { id: "p8", name: "DELONGHI Dedica Espresso", brand: "Delonghi", categorySlug: "machine-a-cafe", price: 39900, stock: 7, description: "Machine espresso élégante et compacte au corps en acier inoxydable. Technologie Thermoblock pour la température idéale et système Cappuccino réglable pour une mousse de lait crémeuse.", imageUrl: "/img/coffee-delonghi-dedica.png", specs: { sku: "EC685M", pression: "15 bars", chauffe: "Thermoblock", corps: "Acier inoxydable", largeur: "15", hauteur: "33", profondeur: "28" }, isActive: true },
  { id: "p9", name: "Delonghi Lattissima One Nespresso", brand: "Delonghi", categorySlug: "machine-a-cafe", price: 59900, stock: 6, description: "Machine à capsules Nespresso avec système lait automatique : cappuccino et latte macchiato d'une simple pression.", imageUrl: "/img/coffee-lattissima.png", specs: { type: "Capsules", systeme: "Nespresso", lait: "Automatique", largeur: "17", hauteur: "32", profondeur: "26" }, isActive: true },
  { id: "p10", name: "Delonghi Stilosa EC235.BK", brand: "Delonghi", categorySlug: "machine-a-cafe", price: 36000, stock: 10, description: "Machine expresso manuelle 15 bars avec buse cappuccino pour un lait onctueux. Design compact noir.", imageUrl: "/img/coffee-delonghi-black.png", specs: { sku: "EC235.BK", pression: "15 bars", buse: "Cappuccino", largeur: "18", hauteur: "31", profondeur: "24" }, isActive: true },
  { id: "p11", name: "Condor Réfrigérateur No Frost 470L", brand: "Condor", categorySlug: "refrigerateur", price: 128000, stock: 6, description: "Réfrigérateur combiné No Frost grande capacité, classe A+.", imageUrl: "/img/fridge.png", specs: { capacite: "470 L", technologie: "No Frost", classe: "A+", largeur: "70", hauteur: "185", profondeur: "70" }, isActive: true },
  { id: "p12", name: "Condor Machine à laver 8kg", brand: "Condor", categorySlug: "machine-a-laver", price: 62000, stock: 9, description: "Lave-linge frontal 8 kg, 1200 tr/min, 15 programmes.", imageUrl: washerImg, specs: { capacite: "8 kg", essorage: "1200 tr/min", programmes: "15", largeur: "60", hauteur: "85", profondeur: "55" }, isActive: true },
  { id: "p13", name: "Condor Cuisinière 4 feux", brand: "Condor", categorySlug: "cuisiniere", price: 48000, stock: 7, description: "Cuisinière à gaz 4 feux avec four et allumage électrique.", imageUrl: "/img/oven.png", specs: { feux: "4", four: "Gaz", allumage: "Électrique", largeur: "60", hauteur: "90", profondeur: "60" }, isActive: true },
  { id: "p14", name: "Condor Micro-onde 25L", brand: "Condor", categorySlug: "micro-onde", price: 21500, stock: 11, description: "Four micro-ondes 25 L avec grill, 900 W.", imageUrl: microImg, specs: { capacite: "25 L", puissance: "900 W", grill: "Oui", largeur: "48", hauteur: "28", profondeur: "35" }, isActive: true },
  { id: "p15", name: 'Cristor Téléviseur LED 55" 4K', brand: "Cristor", categorySlug: "tv", price: 74900, stock: 5, description: "Smart TV LED 55 pouces UHD 4K, Android TV intégré.", imageUrl: "/img/tv.png", specs: { taille: '55"', resolution: "4K UHD", os: "Android TV", largeur: "123", hauteur: "71", profondeur: "8" }, isActive: true },
  { id: "p16", name: "Techwood Robot Pétrin 1200W", brand: "Techwood", categorySlug: "cuisiniere", price: 34900, stock: 8, description: "Robot pâtissier multifonction avec bol inox, fouet, crochet et batteur. Idéal pour pâtisserie et boulangerie maison.", imageUrl: "/img/mixer.png", specs: { puissance: "1200 W", bol: "Inox 5 L", vitesses: "6", largeur: "28", hauteur: "35", profondeur: "22" }, isActive: true },
  { id: "p17", name: "Condor Réfrigérateur Combiné 350L", brand: "Condor", categorySlug: "refrigerateur", price: 89000, stock: 8, description: "Réfrigérateur combiné 350 L No Frost, classe A. Idéal pour familles moyennes, économe en énergie.", imageUrl: "/img/fridge.png", specs: { capacite: "350 L", technologie: "No Frost", classe: "A", largeur: "60", hauteur: "170", profondeur: "60" }, isActive: true },
  { id: "p18", name: "Beko Réfrigérateur Side-by-Side 610L", brand: "Beko", categorySlug: "refrigerateur", price: 165000, stock: 4, description: "Réfrigérateur Side-by-Side grande capacité 610 L avec distributeur d'eau et compresseur inverter silencieux.", imageUrl: "/img/fridge.png", specs: { capacite: "610 L", technologie: "No Frost", distributeur: "Eau", compresseur: "Inverter", largeur: "91", hauteur: "180", profondeur: "72" }, isActive: true },
  { id: "p19", name: "Condor Congélateur Coffre 250L", brand: "Condor", categorySlug: "congelateur", price: 72000, stock: 7, description: "Congélateur coffre 250 L avec fonction de congélation rapide jusqu'à -24°C. Parfait pour stockages longue durée.", imageUrl: "/img/fridge.png", specs: { capacite: "250 L", type: "Coffre", congelation: "-24°C", minuteur: "Oui", largeur: "100", hauteur: "85", profondeur: "70" }, isActive: true },
  { id: "p20", name: "Beko Congélateur Vertical 180L", brand: "Beko", categorySlug: "congelateur", price: 58000, stock: 6, description: "Congélateur vertical 180 L sans givre, 5 tiroirs coulissants pour un rangement organisé et facile d'accès.", imageUrl: "/img/fridge.png", specs: { capacite: "180 L", type: "Vertical", tiroirs: "5", givre: "Sans givre", largeur: "55", hauteur: "145", profondeur: "60" }, isActive: true },
  { id: "p21", name: "Beko Lave-linge Frontal 9kg 1400", brand: "Beko", categorySlug: "machine-a-laver", price: 78000, stock: 5, description: "Lave-linge frontal 9 kg, essorage 1400 tr/min, fonction vapeur, 16 programmes dont rapide 30 min et laine.", imageUrl: washerImg, specs: { capacite: "9 kg", essorage: "1400 tr/min", programmes: "16", vapeur: "Oui", largeur: "60", hauteur: "85", profondeur: "56" }, isActive: true },
  { id: "p22", name: "Beko Lave-vaisselle 14 Couverts", brand: "Beko", categorySlug: "lave-vaisselle", price: 54000, stock: 7, description: "Lave-vaisselle 14 couverts, 8 programmes, classe A++. Silencieux à 42 dB avec démarrage différé jusqu'à 9h.", imageUrl: "/img/fridge.png", specs: { capacite: "14 couverts", programmes: "8", classe: "A++", bruit: "42 dB", largeur: "60", hauteur: "85", profondeur: "57" }, isActive: true },
  { id: "p23", name: "Bomann Lave-vaisselle Compact 6 Couverts", brand: "Bomann", categorySlug: "lave-vaisselle", price: 39000, stock: 9, description: "Lave-vaisselle compact 6 couverts, idéal pour petits espaces. 6 programmes et faible consommation d'eau.", imageUrl: "/img/fridge.png", specs: { capacite: "6 couverts", programmes: "6", type: "Compact", installation: "Pose libre", largeur: "42", hauteur: "60", profondeur: "48" }, isActive: true },
  { id: "p24", name: "Beko Cuisinière 5 Feux + Four Électrique", brand: "Beko", categorySlug: "cuisiniere", price: 65000, stock: 5, description: "Cuisinière 5 feux dont 1 triple couronne, four électrique 65 L avec minuterie et gril. Allumage automatique.", imageUrl: "/img/oven.png", specs: { feux: "5", four: "Électrique 65 L", allumage: "Automatique", minuterie: "Oui", largeur: "60", hauteur: "90", profondeur: "60" }, isActive: true },
  { id: "p25", name: "Beko Micro-onde 30L avec Grill", brand: "Beko", categorySlug: "micro-onde", price: 28000, stock: 10, description: "Four micro-ondes 30 L, puissance 1000 W avec fonction grill et décongélation automatique par poids.", imageUrl: microImg, specs: { capacite: "30 L", puissance: "1000 W", grill: "Oui", defrost: "Automatique", largeur: "52", hauteur: "31", profondeur: "38" }, isActive: true },
  { id: "p26", name: "Bomann Micro-onde Compact 20L", brand: "Bomann", categorySlug: "micro-onde", price: 16500, stock: 14, description: "Micro-ondes compact 20 L, 700 W, 6 niveaux de puissance. Commandes mécaniques simples et robustes.", imageUrl: microImg, specs: { capacite: "20 L", puissance: "700 W", niveaux: "6", type: "Mécanique", largeur: "44", hauteur: "26", profondeur: "32" }, isActive: true },
  { id: "p27", name: 'Cristor TV LED 43" Full HD', brand: "Cristor", categorySlug: "tv", price: 49000, stock: 8, description: "Smart TV LED 43 pouces Full HD avec système d'exploitation embarqué, applications streaming et Wi-Fi intégré.", imageUrl: "/img/tv.png", specs: { taille: '43"', resolution: "Full HD", os: "Smart TV", largeur: "97", hauteur: "56", profondeur: "8" }, isActive: true },
  { id: "p28", name: 'Beko TV QLED 50" 4K HDR', brand: "Beko", categorySlug: "tv", price: 89000, stock: 4, description: "Téléviseur QLED 50 pouces 4K UHD avec HDR10+ et Dolby Audio. Couleurs éclatantes et contraste profond.", imageUrl: "/img/tv.png", specs: { taille: '50"', resolution: "4K UHD", technologie: "QLED", audio: "Dolby Audio", largeur: "111", hauteur: "65", profondeur: "8" }, isActive: true },
];

const bundles = [
  {
    id: "b1",
    name: "Pack Mariage",
    description: "L'essentiel électroménager pour bien démarrer : réfrigérateur, machine à laver, cuisinière et micro-onde.",
    imageUrl: "/img/fridge.png",
    bundlePrice: 239000,
    isActive: true,
    items: [
      { productId: "p11", quantity: 1 },
      { productId: "p12", quantity: 1 },
      { productId: "p13", quantity: 1 },
      { productId: "p14", quantity: 1 },
    ],
  },
  {
    id: "b2",
    name: "Pack Café",
    description: "Pour les amateurs de café : expresso Delonghi Dedica + machine à capsules Lattissima.",
    imageUrl: "/img/coffee-delonghi-dedica.png",
    bundlePrice: 89900,
    isActive: true,
    items: [
      { productId: "p8", quantity: 1 },
      { productId: "p9", quantity: 1 },
    ],
  },
];

const today = new Date();
const inDays = (n: number) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);
const agoDays = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);

const offers = [
  { id: "o1", title: "-14% BOSCH Aqua Wash", type: "percentage", value: 14, scope: "product", targetId: "p7", startsAt: agoDays(5), endsAt: inDays(20), isActive: true },
  { id: "o2", title: "-13% Delonghi Dedica", type: "percentage", value: 13, scope: "product", targetId: "p8", startsAt: agoDays(3), endsAt: inDays(15), isActive: true },
  { id: "o3", title: "Promo Machine à café -10%", type: "percentage", value: 10, scope: "category", targetId: "machine-a-cafe", startsAt: agoDays(1), endsAt: inDays(10), isActive: true },
];

async function main() {
  console.log("Seeding database...");

  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const c of categories) {
    await prisma.category.create({ data: c });
  }
  for (const p of products) {
    await prisma.product.create({ data: { ...p, specs: p.specs as any } });
  }
  for (const b of bundles) {
    const { items, ...rest } = b;
    await prisma.bundle.create({
      data: {
        ...rest,
        items: { create: items },
      },
    });
  }
  for (const o of offers) {
    await prisma.offer.create({ data: o });
  }

  console.log("Seeded:", categories.length, "categories,", products.length, "products,", bundles.length, "bundles,", offers.length, "offers");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });