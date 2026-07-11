import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageCtx {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navbar
    "nav.home": "Accueil",
    "nav.searchPlaceholder": "Rechercher par nom de produit...",
    "nav.myCart": "Mon panier",
    
    // Home V2
    "home.newCollection": "NOUVELLE COLLECTION 2024",
    "home.titleMain": "L'Ingénierie du",
    "home.titleGold": "Confort Moderne",
    "home.description": "Découvrez une sélection exclusive d'appareils haut de gamme alliant performance technologique et design minimaliste pour votre foyer.",
    "home.explore": "Explorer la Collection",
    "home.watchVideo": "Voir la vidéo",
    
    // Value Props
    "props.quality": "Produit de qualité",
    "props.qualitySub": "Garantis jusqu'à 48 mois",
    "props.delivery": "Livraison rapide",
    "props.deliverySub": "Toute l'Algérie",
    "props.support": "Service client",
    "props.supportSub": "Réactif et à l'écoute",
    
    // Categories & Promos
    "home.categoriesTitle": "Découvrez nos",
    "home.categoriesTitleAccent": "Catégories",
    "home.promotionsTitle": "Découvrez nos",
    "home.promotionsTitleAccent": "Promotions",
    "home.seeAll": "VOIR TOUT",
    "home.brandsTitle": "Nos",
    "home.brandsTitleAccent": "marques",
    "home.brandsTitleSub": "populaires",
    
    // Category Page
    "category.homeBreadcrumb": "ACCUEIL",
    "category.productsCount": "PRODUIT(S)",
    "category.empty": "Aucun produit dans cette catégorie pour le moment.",
    
    // Product Page
    "product.notFound": "Produit introuvable.",
    "product.back": "Retour",
    "product.inStock": "EN STOCK",
    "product.outOfStock": "RUPTURE DE STOCK",
    "product.addToCart": "AJOUTER AU PANIER",
    "product.original": "PRODUITS ORIGINAUX",
    "product.delivery58": "LIVRAISON 58 WILAYAS",
    "product.cod": "PAIEMENT À LA LIVRAISON",
    
    // Cart Page
    "cart.title": "Mon Panier",
    "cart.empty": "Votre panier est vide.",
    "cart.clear": "VIDER LE PANIER",
    "cart.total": "TOTAL",
    "cart.orderBtn": "COMMANDER (PAIEMENT À LA LIVRAISON)",
    "cart.success": "Commande enregistrée",
    "cart.successSub": "Nous vous appellerons pour confirmer la livraison (paiement à la livraison).",
    "cart.error": "Erreur lors de l'enregistrement de la commande.",

    // Footer
    "footer.desc": "Electro Zone est un site de vente en ligne spécialisé dans l'électroménager et le multimédia. Une large gamme de produits de qualité à des prix compétitifs.",
    "footer.info": "Informations",
    "footer.shop": "Boutique",
    "footer.dashboard": "Tableau de bord",
    "footer.phone": "Tél",
    "footer.follow": "Suivez-nous",
    "footer.brands": "Nos marques",

    // Assistant
    "assistant.welcome": "Bonjour ! Je suis l'assistant ElectroZone. Dites-moi ce que vous cherchez et votre budget (en DA), et je vous guide vers le bon produit.",
    "assistant.title": "Assistant ElectroZone",
    "assistant.subtitle": "Guidé par vos besoins & votre budget",
    "assistant.placeholder": "Ex: frigo pour 130000 DA",
    "assistant.error": "Désolé, une erreur est survenue. Réessayez.",

    // Categories names mapping
    "cat.refrigerateur": "Réfrigérateur",
    "cat.congelateur": "Congélateur",
    "cat.machine-a-laver": "Machine à laver",
    "cat.lave-vaisselle": "Lave-vaisselle",
    "cat.cuisiniere": "Cuisinière",
    "cat.micro-onde": "Micro-onde",
    "cat.machine-a-cafe": "Machine à café",
    "cat.tv": "Téléviseur",
    "cat.aspirateur": "Aspirateur"
  },
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.searchPlaceholder": "Search by product name...",
    "nav.myCart": "My Cart",
    
    // Home V2
    "home.newCollection": "NEW COLLECTION 2024",
    "home.titleMain": "Engineering of",
    "home.titleGold": "Modern Comfort",
    "home.description": "Discover an exclusive selection of high-end appliances combining technological performance and minimalist design for your home.",
    "home.explore": "Explore the Collection",
    "home.watchVideo": "Watch Video",
    
    // Value Props
    "props.quality": "Quality Product",
    "props.qualitySub": "Guaranteed up to 48 months",
    "props.delivery": "Fast Delivery",
    "props.deliverySub": "All over Algeria",
    "props.support": "Customer Service",
    "props.supportSub": "Responsive & listening",
    
    // Categories & Promos
    "home.categoriesTitle": "Discover Our",
    "home.categoriesTitleAccent": "Categories",
    "home.promotionsTitle": "Discover Our",
    "home.promotionsTitleAccent": "Promotions",
    "home.seeAll": "SEE ALL",
    "home.brandsTitle": "Our",
    "home.brandsTitleAccent": "Popular",
    "home.brandsTitleSub": "Brands",
    
    // Category Page
    "category.homeBreadcrumb": "HOME",
    "category.productsCount": "PRODUCT(S)",
    "category.empty": "No products in this category at the moment.",
    
    // Product Page
    "product.notFound": "Product not found.",
    "product.back": "Back",
    "product.inStock": "IN STOCK",
    "product.outOfStock": "OUT OF STOCK",
    "product.addToCart": "ADD TO CART",
    "product.original": "ORIGINAL PRODUCTS",
    "product.delivery58": "58 WILAYAS DELIVERY",
    "product.cod": "CASH ON DELIVERY",
    
    // Cart Page
    "cart.title": "My Cart",
    "cart.empty": "Your cart is empty.",
    "cart.clear": "EMPTY CART",
    "cart.total": "TOTAL",
    "cart.orderBtn": "ORDER (CASH ON DELIVERY)",
    "cart.success": "Order Registered",
    "cart.successSub": "We will call you to confirm delivery (cash on delivery).",
    "cart.error": "Error while processing your order.",

    // Footer
    "footer.desc": "Electro Zone is an online store specializing in household appliances and multimedia. A wide range of quality products at competitive prices.",
    "footer.info": "Information",
    "footer.shop": "Shop",
    "footer.dashboard": "Dashboard",
    "footer.phone": "Tel",
    "footer.follow": "Follow us",
    "footer.brands": "Our Brands",

    // Assistant
    "assistant.welcome": "Hello! I am the ElectroZone assistant. Tell me what you are looking for and your budget (in DA), and I will guide you to the right product.",
    "assistant.title": "ElectroZone Assistant",
    "assistant.subtitle": "Guided by your needs & budget",
    "assistant.placeholder": "E.g.: fridge for 130000 DA",
    "assistant.error": "Sorry, an error occurred. Please try again.",

    // Categories names mapping
    "cat.refrigerateur": "Refrigerator",
    "cat.congelateur": "Freezer",
    "cat.machine-a-laver": "Washing Machine",
    "cat.lave-vaisselle": "Dishwasher",
    "cat.cuisiniere": "Stove",
    "cat.micro-onde": "Microwave",
    "cat.machine-a-cafe": "Coffee Machine",
    "cat.tv": "TV",
    "cat.aspirateur": "Vacuum Cleaner"
  }
};

const Ctx = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("lang") as Language) || "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  };

  const t = (key: string): string => {
    const dict = translations[language];
    return (dict as any)[key] || (translations["fr"] as any)[key] || key;
  };

  return (
    <Ctx.Provider value={{ language, setLanguage, t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTranslation() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTranslation must be used within LanguageProvider");
  return c;
}
