import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { TwoFactorPage } from '../pages/TwoFactorPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CompaniesPage } from '../pages/CompaniesPage';
import { CompanyDetailPage } from '../pages/CompanyDetailPage';
import { CompanyPropertiesPage } from '../pages/CompanyPropertiesPage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import { DocumentViewerPage } from '../pages/DocumentViewerPage';
import { UsersPage } from '../pages/UsersPage';
import { LegalPage } from '../pages/LegalPage';
import { FinancialPage } from '../pages/FinancialPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { AccountsPage } from '../pages/AccountsPage';
import { PropertyManagementPage } from '../pages/PropertyManagementPage';
import { FinancialDashboardPage } from '../pages/FinancialDashboardPage';
import { LegalDashboardPage } from '../pages/LegalDashboardPage';
import { MaintenanceDashboardPage } from '../pages/MaintenanceDashboardPage';
import { AccountsDashboardPage } from '../pages/AccountsDashboardPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { Layout } from '../components/Layout';
import CalendarPage from '../pages/calendar/CalendarPage';
import InvoiceCreatePage from '../pages/invoices/InvoiceCreatePage';
import InvoiceEditPage from '../pages/invoices/InvoiceEditPage';
import { InvoiceViewPage } from '../pages/invoices/InvoiceViewPage';
import { InvoiceDeletePage } from '../pages/invoices/InvoiceDeletePage';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-2fa"
        element={
          <PublicRoute>
            <TwoFactorPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="financial-dashboard" element={<FinancialDashboardPage />} />
        <Route path="legal-dashboard" element={<LegalDashboardPage />} />
        <Route path="maintenance-dashboard" element={<MaintenanceDashboardPage />} />
        <Route path="accounts-dashboard" element={<AccountsDashboardPage />} />
        <Route path="property-management" element={<PropertyManagementPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="companies/:id/properties" element={<CompanyPropertiesPage />} />
        <Route path="companies/:companyId/properties/:propertyId" element={<PropertyDetailPage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/new" element={<InvoiceCreatePage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId" element={<InvoiceViewPage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId/edit" element={<InvoiceEditPage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId/delete" element={<InvoiceDeletePage />} />
        <Route path="companies/:companyId/properties/:propertyId/documents/:documentId" element={<DocumentViewerPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="legal" element={<LegalPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="tasks" element={<PlaceholderPage title="Tasks" />} />
        <Route path="invoices" element={<PlaceholderPage title="Invoices" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
