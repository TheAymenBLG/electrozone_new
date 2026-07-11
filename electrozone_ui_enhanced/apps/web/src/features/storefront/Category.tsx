import { useParams, Link } from "react-router-dom";
import { useProducts, useOffers, useCategories } from "../../data/store";
import ProductCard from "../../components/ProductCard";
import { useTranslation } from "../../context/LanguageContext";

export default function Category() {
  const { slug } = useParams();
  const products = useProducts();
  const offers = useOffers();
  const categories = useCategories();
  const { t } = useTranslation();
  
  const cat = categories.find((c) => c.slug === slug);
  const items = products.filter((p) => p.categorySlug === slug && p.isActive);
  const catTitle = cat ? (t("cat." + cat.slug) || cat.name) : "Catégorie";

  return (
    <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-10">
      <nav className="font-mono text-xs text-cloud-muted mb-6">
        <Link to="/" className="hover:text-gold">{t("category.homeBreadcrumb")}</Link>
        <span className="mx-2">/</span>
        <span className="text-gold uppercase">{catTitle}</span>
      </nav>
      <div className="flex items-end justify-between mb-8 border-b border-edge pb-4">
        <h1 className="font-head font-bold text-3xl md:text-4xl">{catTitle}</h1>
        <span className="font-mono text-xs text-cloud-muted">{items.length} {t("category.productsCount")}</span>
      </div>
      {items.length === 0 ? (
        <div className="bg-navy-card border border-edge rounded-xl p-16 text-center text-cloud-muted">
          {t("category.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} offers={offers} />
          ))}
        </div>
      )}
    </div>
  );
}
