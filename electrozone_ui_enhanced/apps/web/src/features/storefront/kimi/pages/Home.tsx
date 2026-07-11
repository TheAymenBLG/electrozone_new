import Navbar from '../components/Navbar'
import Hero from '../sections/Hero'
import BrandsMarquee from '../sections/BrandsMarquee'
import Categories from '../sections/Categories'
import ProductsSection from '../sections/Products'
import Promotions from '../sections/Promotions'
import PopularBrands from '../sections/PopularBrands'
import Experience from '../sections/Experience'
import WhyChooseUs from '../sections/WhyChooseUs'
import Newsletter from '../sections/Newsletter'
import Footer from '../sections/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-ez-bg noise-overlay">
      <Navbar />
      <Hero />
      <BrandsMarquee />
      <Categories />
      <ProductsSection />
      <Promotions />
      <PopularBrands />
      <Experience />
      <WhyChooseUs />
      <Newsletter />
      <Footer />
    </div>
  )
}
