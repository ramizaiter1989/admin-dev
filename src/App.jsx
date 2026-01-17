import "@/index.css";
import "@/App.css";
import "@/i18n/config";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthPage } from "@/pages/AuthPage";
import api from "@/lib/axios";
import AdminPanelPage from "@/pages/AdminPanelPage";
import AdminAuthPage from "@/pages/AdminAuthPage";
import { SEO } from "@/components/SEO";

// ============================
// Route Guards
// ============================
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!isAuthenticated) return <Navigate to="/admin-auth" replace />;
  if (user.role !== "admin") return <Navigate to="/admin-auth" replace />;

  return children;
};

// ============================
// Page Layout Wrapper
// ============================
const PageLayout = ({ children, noIndex = false }) => {
  return (
    <>
      <SEO noIndex={noIndex} />
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

// ============================
// App
// ============================
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
          <Route
            path="/"
            element={
              <AdminRoute>
                <PageLayout noIndex>
                  <AdminPanelPage />
                </PageLayout>
              </AdminRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin-auth"
            element={
              <PageLayout noIndex>
                <AdminAuthPage />
              </PageLayout>
            }
          />
          <Route
            path="/admin-panel-page"
            element={
              <AdminRoute>
                <PageLayout noIndex>
                  <AdminPanelPage />
                </PageLayout>
              </AdminRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
