import { useEffect } from "react";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import AIEnginePage from "./pages/AIEnginePage";
import AdminNoticesPage from "./pages/AdminNoticesPage";
import AdminPage from "./pages/AdminPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import CasesPage from "./pages/CasesPage";
import CustomerHistoryPage from "./pages/CustomerHistoryPage";
import DashboardPage from "./pages/DashboardPage";
import DataManagementPage from "./pages/DataManagementPage";
import ExistingCasesPage from "./pages/ExistingCasesPage";
import ExistingStockPage from "./pages/ExistingStockPage";
import InventoryPage from "./pages/InventoryPage";
import IssuedPartsPage from "./pages/IssuedPartsPage";
import LifecyclePage from "./pages/LifecyclePage";
import LoginPage from "./pages/LoginPage";
import MastersPage from "./pages/MastersPage";
import NewCasePage from "./pages/NewCasePage";
import NotificationsPage from "./pages/NotificationsPage";
import PartDetailPage from "./pages/PartDetailPage";
import PartRequestsPage from "./pages/PartRequestsPage";
import PartsPage from "./pages/PartsPage";
import ProfilePage from "./pages/ProfilePage";
import PurchasePage from "./pages/PurchasePage";
import RegisterApprovedPage from "./pages/RegisterApprovedPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterPendingPage from "./pages/RegisterPendingPage";
import RegisterRejectedPage from "./pages/RegisterRejectedPage";
import ReportsPage from "./pages/ReportsPage";
import ReturnToCompanyPage from "./pages/ReturnToCompanyPage";
import SettingsPage from "./pages/SettingsPage";
import TechniciansPage from "./pages/TechniciansPage";
import VendorsPage from "./pages/VendorsPage";
import WarehousePage from "./pages/WarehousePage";
import { backendGetUsers } from "./services/userBackend";
import { useStore } from "./store";

export default function App() {
  const {
    currentUser,
    currentPage,
    isInitializing,
    initUsers,
    sessionExpired,
  } = useStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: initUsers is a stable zustand action, run once on mount
  useEffect(() => {
    initUsers();
  }, []);

  // Auto-logout polling: if logged in user is deleted by admin, log them out live.
  // Combined with user sync: the main poll syncs users every 5 seconds.
  // This lightweight check just verifies the current user still exists.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional polling
  useEffect(() => {
    if (!currentUser) return;
    const check = () => {
      const latestUsers = useStore.getState().users;
      if (latestUsers.length === 0) return; // Guard: never logout on empty list
      const found = latestUsers.find(
        (u) =>
          u.id === currentUser.id ||
          u.email.toLowerCase() === currentUser.email.toLowerCase(),
      );
      if (!found) {
        useStore.getState().logout();
      }
    };
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Live sync polling: sync all data every 5 seconds when logged in
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional polling
  useEffect(() => {
    if (!currentUser) return;
    const poll = async () => {
      const store = useStore.getState();
      // Sync users from backend first so any new registrations/approvals are visible
      try {
        const freshUsers = await backendGetUsers();
        if (freshUsers.length > 0) {
          const cu = useStore.getState().currentUser;
          const updatedUsers = freshUsers.map((u) => {
            if (
              cu &&
              (u.id === cu.id ||
                u.email.toLowerCase() === cu.email.toLowerCase())
            ) {
              return { ...u, isOnline: true };
            }
            return u;
          });
          useStore.setState({ users: updatedUsers });
        }
      } catch {
        /* ignore */
      }
      await Promise.allSettled([
        store.syncCases(),
        store.syncPartRequests(),
        store.syncNotices(),
        store.syncInventory(),
        store.syncAppData(),
      ]);
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);
  // Session timeout: after 30 min of inactivity, mark session as expired.
  // The user stays on the current page; on NEXT interaction they get redirected to login.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional inactivity timer
  useEffect(() => {
    if (!currentUser) return;
    const TIMEOUT_MS = 30 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;

    const onActivity = () => {
      if (useStore.getState().sessionExpired) {
        // Session expired: redirect to login on next interaction
        useStore.getState().logout();
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        useStore.getState().setSessionExpired(true);
      }, TIMEOUT_MS);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    for (const e of events)
      window.addEventListener(e, onActivity, { passive: true });
    timer = setTimeout(() => {
      useStore.getState().setSessionExpired(true);
    }, TIMEOUT_MS);

    return () => {
      clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, onActivity);
    };
  }, [currentUser?.id]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-950 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg font-medium tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (currentPage === "register") return <RegisterPage />;
    if (currentPage === "register-pending") return <RegisterPendingPage />;
    if (currentPage === "register-approved") return <RegisterApprovedPage />;
    if (currentPage === "register-rejected") return <RegisterRejectedPage />;
    return <LoginPage />;
  }

  return (
    <>
      {sessionExpired && (
        <button
          type="button"
          className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white text-center py-2 text-sm font-medium cursor-pointer w-full"
          onClick={() => useStore.getState().logout()}
        >
          ⚠️ Your session has expired. Click here to log in again.
        </button>
      )}
      <Layout>
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "cases" && <CasesPage />}
        {currentPage === "new-case" && <NewCasePage />}
        {currentPage === "case-detail" && <CaseDetailPage />}
        {currentPage === "customer-history" && <CustomerHistoryPage />}
        {currentPage === "parts" && <PartsPage />}
        {currentPage === "technicians" && <TechniciansPage />}
        {currentPage === "reports" && <ReportsPage />}
        {currentPage === "settings" && <SettingsPage />}
        {currentPage === "admin" && <AdminPage />}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "inventory" && <InventoryPage />}
        {currentPage === "purchase" && <PurchasePage />}
        {currentPage === "part-detail" && <PartDetailPage />}
        {currentPage === "issued-parts" && <IssuedPartsPage />}
        {currentPage === "warehouse" && <WarehousePage />}
        {currentPage === "masters" && <MastersPage />}
        {currentPage === "part-requests" && <PartRequestsPage />}
        {currentPage === "vendors" && <VendorsPage />}
        {currentPage === "return-to-company" && <ReturnToCompanyPage />}
        {currentPage === "lifecycle" && <LifecyclePage />}
        {currentPage === "ai-engine" && <AIEnginePage />}
        {currentPage === "notifications" && <NotificationsPage />}
        {currentPage === "audit-logs" && <AuditLogsPage />}
        {currentPage === "notices" && <AdminNoticesPage />}
        {currentPage === "data-management" && <DataManagementPage />}
        {currentPage === "existing-stock" && <ExistingStockPage />}
        {currentPage === "existing-cases" && <ExistingCasesPage />}
        {![
          "dashboard",
          "cases",
          "new-case",
          "case-detail",
          "customer-history",
          "parts",
          "technicians",
          "reports",
          "settings",
          "admin",
          "profile",
          "inventory",
          "purchase",
          "part-detail",
          "issued-parts",
          "warehouse",
          "masters",
          "part-requests",
          "vendors",
          "return-to-company",
          "lifecycle",
          "ai-engine",
          "notifications",
          "audit-logs",
          "notices",
          "data-management",
          "existing-stock",
          "existing-cases",
        ].includes(currentPage) && <DashboardPage />}
      </Layout>
      <Toaster position="top-right" />
    </>
  );
}
