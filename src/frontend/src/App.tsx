import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import CasesPage from "./pages/CasesPage";
import CustomerHistoryPage from "./pages/CustomerHistoryPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NewCasePage from "./pages/NewCasePage";
import PartsPage from "./pages/PartsPage";
import RegisterPage from "./pages/RegisterPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import TechniciansPage from "./pages/TechniciansPage";
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
    </Layout>
  );
}
