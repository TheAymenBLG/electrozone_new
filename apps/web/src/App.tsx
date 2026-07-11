import { Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AssistantWidget from "./components/AssistantWidget";
import CartToast from "./components/CartToast";
import CompareTray from "./components/CompareTray";
import CompareOverlay from "./components/CompareOverlay";
import Home from "./features/storefront/Home";
import Category from "./features/storefront/Category";
import ProductPage from "./features/storefront/ProductPage";
import Cart from "./features/storefront/Cart";
import Checkout from "./features/storefront/Checkout";
import OrderTracking from "./features/storefront/OrderTracking";
import SearchPage from "./features/storefront/Search";
import AdminLayout from "./features/admin/AdminLayout";
import Dashboard from "./features/admin/Dashboard";
import AdminProducts from "./features/admin/Products";
import AdminBundles from "./features/admin/Bundles";
import AdminOffers from "./features/admin/Offers";
import AdminAnalytics from "./features/admin/Analytics";
import AdminOrders from "./features/admin/Orders";
import AdminCustomers from "./features/admin/Customers";
import AdminRetention from "./features/admin/Retention";

function StorefrontLayout() {
  const [compareOpen, setCompareOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-navy text-cloud font-sans">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <AssistantWidget />
      <CartToast />
      <CompareTray onOpen={() => setCompareOpen(true)} />
      <CompareOverlay open={compareOpen} onClose={() => setCompareOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/c/:slug" element={<Category />} />
        <Route path="/p/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderTracking />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="bundles" element={<AdminBundles />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="retention" element={<AdminRetention />} />
      </Route>
    </Routes>
  );
}
