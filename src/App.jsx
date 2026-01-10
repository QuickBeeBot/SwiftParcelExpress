// src/App.jsx
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Layouts
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { GlobalContactWidgets } from '@/components/GlobalContactWidgets';

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const GetQuote = lazy(() => import('@/pages/GetQuote'));
const TrackShipment = lazy(() => import('@/pages/TrackShipment'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const Login = lazy(() => import('@/pages/Login'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const InvoiceDetails = lazy(() => import('@/pages/InvoiceDetails'));
const Payment = lazy(() => import('@/pages/Payment'));

// Dashboard
const Billing = lazy(() => import('@/components/Dashboard/Billing'));
const Documents = lazy(() => import('@/components/Dashboard/Documents'));
const DashboardLayout = lazy(() => import('@/components/Dashboard/DashboardLayout'));
const DashboardOverview = lazy(() => import('@/components/Dashboard/DashboardOverview'));
const NewShipmentForm = lazy(() => import('@/components/Dashboard/NewShipmentForm'));
const TrackingPage = lazy(() => import('@/components/Dashboard/TrackingPage'));
const PublicTrackingPage = lazy(() => import('@/components/PublicTrackingPage'));
const ShipmentsPage = lazy(() => import('@/components/Dashboard/ShipmentsPage'));
const OrdersPage = lazy(() => import('@/components/Dashboard/OrdersPage'));
const MessagesPage = lazy(() => import('@/components/Dashboard/MessagesPage'));
const ActivityPage = lazy(() => import('@/components/Dashboard/ActivityPage'));
const ReportPage = lazy(() => import('@/components/Dashboard/ReportPage'));
const SupportPage = lazy(() => import('@/components/Dashboard/SupportPage')); 
const AccountPage = lazy(() => import('@/components/Dashboard/AccountPage'));
const SettingsPage = lazy(() => import('@/components/Dashboard/SettingsPage'));
const LiveMapTrackingPage = lazy(() => import('@/components/Dashboard/LiveMapTrackingPage'));

// Admin
const AdminLayout = lazy(() => import('@/components/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/components/Admin/Dashboard')); 
const AdminShipmentsPage = lazy(() => import('@/components/Admin/AdminApprovedShipmentsPage'));
const AdminCompletedShipmentsPage = lazy(() => import('@/components/Admin/AdminCompletedShipmentsPage'));
const PendingAdminShipmentsPage = lazy(() => import('@/components/Admin/PendingShipmentsPage'));
const AdminTicketsPage = lazy(() => import('@/components/Admin/TicketsPage'));
const AdminUsersPage = lazy(() => import('@/components/Admin/UsersPage'));
const AdminReportsPage = lazy(() => import('@/components/Admin/ReportsPage'));
const AdminSettingsPage = lazy(() => import('@/components/Admin/SettingsPage'));
const AdminCreateDeliveryPage = lazy(() => import('@/components/Admin/AdminCreateDeliveryPage'));
const NotificationsPage = lazy(() => import('@/components/Admin/NotificationsPage'));

// ======================
// Custom Hooks
// ======================

const useAdminAuths = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().role === 'admin');
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [currentUser]);

  return {
    adminUser: isAdmin ? currentUser : null,
    loading: authLoading || loading,
  };
};


const useAdminAuth = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!currentUser) {
        console.log('❌ No current user');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('🔍 Checking admin for UID:', currentUser.uid);
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        console.log('📄 Doc exists:', userDoc.exists());
        console.log('📂 Data:', userDoc.data());

        const validAdmin = userDoc.exists() && userDoc.data().role === 'admin';
        console.log('✅ Is admin?', validAdmin);

        setIsAdmin(validAdmin);
      } catch (error) {
        console.error('🔥 Firestore error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [currentUser]);

  return {
    adminUser: isAdmin ? currentUser : null,
    loading: authLoading || loading,
  };
};

// ======================
// Protected Route Components
// ======================

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { adminUser, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <div className="flex min-h-screen items-center justify-center">Verifying...</div>;
  if (!adminUser) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  return children;
};

// ======================
// Layout Wrappers
// ======================

const PublicLayout = ({ children }) => (
  <>
    <Navigation />
    <main className="flex-grow relative">{children}</main>
    <GlobalContactWidgets />
    <Footer />
  </>
);

const DashboardLayoutWrapper = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const AdminLayoutWrapper = ({ children }) => (
  <ProtectedAdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedAdminRoute>
);

// ======================
// Main App
// ======================

const AppContent = () => {
  return (
    <>
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <div className="min-h-screen bg-[#1F1F1F] text-white font-['DM_Sans'] flex flex-col">
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
          <Routes>
            {/* ✅ Public Routes — with Navigation + Footer */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="tracking" element={<PublicTrackingPage />} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/quote" element={<PublicLayout><GetQuote /></PublicLayout>} />
            <Route path="/track" element={<PublicLayout><TrackShipment /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
            <Route path="/cookies" element={<PublicLayout><Cookies /></PublicLayout>} />
            <Route path="/invoices/:id" element={<PublicLayout><InvoiceDetails /></PublicLayout>} />
            <Route path="/payment/:id" element={<PublicLayout><Payment /></PublicLayout>} />
            <Route path="/admin/login" element={<PublicLayout><AdminLogin /></PublicLayout>} />

            {/* ✅ Dashboard — No layout, full screen */}
            <Route
              path="/dashboard"
              element={<DashboardLayoutWrapper />}
            >
              <Route index element={<DashboardOverview />} />
              <Route path="billing" element={<Billing />} />
              <Route path="documents" element={<Documents />} />
              <Route path="shipments" element={<ShipmentsPage />} />
              <Route path="new-shipment" element={<NewShipmentForm />} />
              <Route path="tracking" element={<TrackingPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="report" element={<ReportPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="live-tracking" element={<LiveMapTrackingPage />} />
            </Route>

            {/* ✅ Admin — No layout */}
            <Route path="/admin/*" element={<AdminLayoutWrapper />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="shipments" element={<AdminShipmentsPage />} />
              <Route path="pending-shipments" element={<PendingAdminShipmentsPage />} />
              <Route path="completed-shipments" element={<AdminCompletedShipmentsPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="newshipment" element={<AdminCreateDeliveryPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;


