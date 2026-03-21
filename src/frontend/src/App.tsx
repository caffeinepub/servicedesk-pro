import Layout from "./components/Layout";
import AIEnginePage from "./pages/AIEnginePage";
import AdminPage from "./pages/AdminPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import CasesPage from "./pages/CasesPage";
import CustomerHistoryPage from "./pages/CustomerHistoryPage";
import DashboardPage from "./pages/DashboardPage";
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
import RegisterPage from "./pages/RegisterPage";
import ReportsPage from "./pages/ReportsPage";
import ReturnToCompanyPage from "./pages/ReturnToCompanyPage";
import SettingsPage from "./pages/SettingsPage";
import TechniciansPage from "./pages/TechniciansPage";
import VendorsPage from "./pages/VendorsPage";
import WarehousePage from "./pages/WarehousePage";
import { useStore } from "./store";

export default function App() {
  const { currentUser, currentPage } = useStore();

  if (!currentUser) {
    if (currentPage === "register") return <RegisterPage />;
    return <LoginPage />;
  }

  return (
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
    </Layout>
  );
}
