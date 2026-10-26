import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }          from './contexts/AuthContext';
import ProtectedRoute            from './components/ProtectedRoute';
import AppShell                  from './components/AppShell';
import LoginPage                 from './pages/LoginPage';
import DashboardPage             from './pages/DashboardPage';
import QuotationsPage            from './pages/QuotationsPage';
import CreateQuotationPage       from './pages/CreateQuotationPage';
import EditQuotationPage         from './pages/EditQuotationPage';
import ProductsPage              from './pages/ProductsPage';
import CustomersPage             from './pages/CustomersPage';
import OrdersPage                from './pages/OrdersPage';
import PaymentsPage              from './pages/PaymentsPage';
import SettingsPage              from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all staff */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index                    element={<DashboardPage />} />
            <Route path="quotations"        element={<QuotationsPage />} />
            <Route path="quotations/new"         element={<CreateQuotationPage />} />
            <Route path="quotations/:id/edit"     element={<EditQuotationPage />} />
            <Route path="products"          element={<ProductsPage />} />
            <Route path="customers"         element={<CustomersPage />} />
            <Route path="orders"            element={<OrdersPage />} />
            <Route path="payments"          element={<PaymentsPage />} />

            {/* Owner only */}
            <Route
              path="settings"
              element={
                <ProtectedRoute requiredRole="owner">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
