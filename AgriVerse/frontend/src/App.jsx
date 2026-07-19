import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import CategoryFlowPage from "./pages/CategoryFlowPage.jsx";
import ProductSamplePage from "./pages/ProductSamplePage.jsx";
import CartPage from "./pages/CartPage.jsx";
import OrderStatusPage from "./pages/OrderStatusPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import BestSalePage from "./pages/BestSalePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";

// Resets scroll position on every route change so multi-step flows
// (variety -> age -> quality -> samples) always open at the top.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname]);
  return null;
}

function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin routes render their own shell, without the public navbar/footer */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />

        {/* Public storefront */}
        <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
        <Route path="/best-sale" element={<SiteLayout><BestSalePage /></SiteLayout>} />
        <Route path="/contact" element={<SiteLayout><ContactPage /></SiteLayout>} />
        <Route path="/category/:category/*" element={<SiteLayout><CategoryFlowPage /></SiteLayout>} />
        <Route path="/product/:productId" element={<SiteLayout><ProductSamplePage /></SiteLayout>} />
        <Route path="/cart" element={<SiteLayout><CartPage /></SiteLayout>} />
        <Route path="/order-status/:orderId" element={<SiteLayout><OrderStatusPage /></SiteLayout>} />
        <Route path="/payment/:orderId" element={<SiteLayout><PaymentPage /></SiteLayout>} />
        <Route path="*" element={<SiteLayout><NotFoundPage /></SiteLayout>} />
      </Routes>
    </>
  );
}
