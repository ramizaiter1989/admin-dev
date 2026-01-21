import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthPage } from "@/pages/AuthPage";
import AdminAuthPage from "@/pages/AdminAuthPage";
import { SEO } from "@/components/SEO";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

/* Admin */
import { AdminLayout } from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCarsPage from "@/pages/admin/AdminCarsPage";
import AdminPaymentsPage from "@/pages/admin/AdminPaymentsPage";
import AdminAdsPage from "@/pages/admin/AdminAdsPage";
import AdminFeaturedCarsPage from "@/pages/admin/AdminFeaturedCarsPage";
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage";
import AdminAnnouncementsPage from "@/pages/admin/AdminAnnouncementsPage";
import AdminAppealsPage from "@/pages/admin/AdminAppealsPage";
import AdminHolidaysPage from "@/pages/admin/AdminHolidaysPage";

/* ============================
   Route Guards
============================ */
const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!isAuthenticated) return <Navigate to="/admin-auth" replace />;
  if (user.role !== "admin") return <Navigate to="/admin-auth" replace />;

  return children;
};

/* ============================
   Public Layout
============================ */
const PageLayout = ({ children, noIndex = false }) => (
  <>
    <SEO noIndex={noIndex} />
    <Navbar />
    {children}
    <Footer />
  </>
);

/* ============================
   App
============================ */
function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = localStorage.getItem("language") || "en";
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Admin Auth */}
          <Route
            path="/admin-auth"
            element={
              <PageLayout noIndex>
                <AdminAuthPage />
              </PageLayout>
            }
          />

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="cars" element={<AdminCarsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="ads" element={<AdminAdsPage />} />
            <Route path="featured" element={<AdminFeaturedCarsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="announcements" element={<AdminAnnouncementsPage />} />
            <Route path="appeals" element={<AdminAppealsPage />} />
            <Route path="holidays" element={<AdminHolidaysPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin-panel-page" element={<Navigate to="/admin" replace />} />
        </Routes>

        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
