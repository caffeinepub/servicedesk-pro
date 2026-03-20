import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import CasesPage from "./pages/CasesPage";
import CustomerHistoryPage from "./pages/CustomerHistoryPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import IssuedPartsPage from "./pages/IssuedPartsPage";
import LoginPage from "./pages/LoginPage";
import MastersPage from "./pages/MastersPage";
import NewCasePage from "./pages/NewCasePage";
import PartDetailPage from "./pages/PartDetailPage";
import PartsPage from "./pages/PartsPage";
import ProfilePage from "./pages/ProfilePage";
import PurchasePage from "./pages/PurchasePage";
import RegisterPage from "./pages/RegisterPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import TechniciansPage from "./pages/TechniciansPage";
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
    </Layout>
  );
}
