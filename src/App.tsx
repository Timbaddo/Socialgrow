import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/RouteGuards";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { WebsiteWidget } from "./components/WebsiteWidget";
import { WhatsAppPopup } from "./components/WhatsAppPopup";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { ForgotPasswordPage, ResetPasswordPage } from "./pages/PasswordPages";
import HomePage from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import MyTasksPage from "./pages/MyTasksPage";
import ProgressPage from "./pages/ProgressPage";
import AddProfilePage from "./pages/AddProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import CommunityPage from "./pages/CommunityPage";
import SupportPage from "./pages/SupportPage";
import RulesPage from "./pages/RulesPage";
import AccountPage from "./pages/AccountPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProofReview from "./pages/admin/AdminProofReview";
import AdminFeatured from "./pages/admin/AdminFeatured";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

function Shell() {
  const { appUser } = useAuth();
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-64px)]">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/add-profile" element={<AddProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/account" element={<AccountPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="proofs" element={<AdminProofReview />} />
                <Route path="featured" element={<AdminFeatured />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {appUser && <BottomNav />}
      <WebsiteWidget />
      {appUser && <WhatsAppPopup />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
