import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { TwoFactorPage } from '../pages/TwoFactorPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CompaniesPage } from '../pages/CompaniesPage';
import { ArchivedCompaniesPage } from '../pages/ArchivedCompaniesPage';
import { CompanyDetailPage } from '../pages/CompanyDetailPage';
import { CompanyPropertiesPage } from '../pages/CompanyPropertiesPage';
import { CompanyDocumentsPage } from '../pages/CompanyDocumentsPage';
import { DocumentTypePage } from '../pages/DocumentTypePage';
import { DocumentSubTypePage } from '../pages/DocumentSubTypePage';
import { CompanyArchivedDocumentsPage } from '../pages/CompanyArchivedDocumentsPage';
import { ArchivedDocumentTypePage } from '../pages/ArchivedDocumentTypePage';
import { ArchivedDocumentSubTypePage } from '../pages/ArchivedDocumentSubTypePage';
import { PropertyDocumentsPage } from '../pages/PropertyDocumentsPage';
import { PropertyDocumentTypePage } from '../pages/PropertyDocumentTypePage';
import { PropertyDocumentSubTypePage } from '../pages/PropertyDocumentSubTypePage';
import { TenantDetailPage } from '../pages/TenantDetailPage';
import { TenantDocumentsPage } from '../pages/TenantDocumentsPage';
import { TenantDocumentTypePage } from '../pages/TenantDocumentTypePage';
import { TenantDocumentSubTypePage } from '../pages/TenantDocumentSubTypePage';
import { ArchivedPropertiesPage } from '../pages/ArchivedPropertiesPage';
import { ArchivedTenantsPage } from '../pages/ArchivedTenantsPage';
import { ArchivedInvoicesPage } from '../pages/ArchivedInvoicesPage';
import { ArchivedDocumentsPage } from '../pages/ArchivedDocumentsPage';
import { ArchivedPaymentsPage } from '../pages/ArchivedPaymentsPage';
import { ArchivedCreditNotesPage } from '../pages/ArchivedCreditNotesPage';
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
// import CalendarAccessPage from '../pages/CalendarAccessPage';
import InvoiceCreatePage from '../pages/invoices/InvoiceCreatePage';
import InvoiceEditPage from '../pages/invoices/InvoiceEditPage';
import { InvoiceViewPage } from '../pages/invoices/InvoiceViewPage';
import { InvoiceDeletePage } from '../pages/invoices/InvoiceDeletePage';
import { InvoiceDocumentsPage } from '../pages/invoices/InvoiceDocumentsPage';
import { InvoiceDocumentTypePage } from '../pages/invoices/InvoiceDocumentTypePage';
import { InvoiceDocumentSubTypePage } from '../pages/invoices/InvoiceDocumentSubTypePage';
import { PaymentDetailPage } from '../pages/PaymentDetailPage';
import { CreditNoteDetailPage } from '../pages/CreditNoteDetailPage';
import { PaymentDocumentsPage } from '../pages/PaymentDocumentsPage';
import { PaymentDocumentTypePage } from '../pages/PaymentDocumentTypePage';
import { PaymentDocumentSubTypePage } from '../pages/PaymentDocumentSubTypePage';
import { ArchivedPaymentDocumentsPage } from '../pages/ArchivedPaymentDocumentsPage';
import { ArchivedPaymentDocumentTypePage } from '../pages/ArchivedPaymentDocumentTypePage';
import { ArchivedPaymentDocumentSubTypePage } from '../pages/ArchivedPaymentDocumentSubTypePage';
import { CreditNoteDocumentsPage } from '../pages/CreditNoteDocumentsPage';
import { CreditNoteDocumentTypePage } from '../pages/CreditNoteDocumentTypePage';
import { CreditNoteDocumentSubTypePage } from '../pages/CreditNoteDocumentSubTypePage';
import { ArchivedCreditNoteDocumentsPage } from '../pages/ArchivedCreditNoteDocumentsPage';
import { ArchivedCreditNoteDocumentTypePage } from '../pages/ArchivedCreditNoteDocumentTypePage';
import { ArchivedCreditNoteDocumentSubTypePage } from '../pages/ArchivedCreditNoteDocumentSubTypePage';
import MeetingDetailPage from '../pages/MeetingDetailPage';
import RentReviewDetailPage from '../pages/RentReviewDetailPage';

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
        <Route path="companies/archived" element={<ArchivedCompaniesPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="companies/:companyId/documents" element={<CompanyDocumentsPage />} />
        <Route path="companies/:companyId/documents/type/:documentType" element={<DocumentTypePage />} />
        <Route path="companies/:companyId/documents/subtype/:documentSubType" element={<DocumentSubTypePage />} />
        <Route path="companies/:companyId/properties/:propertyId/documents" element={<PropertyDocumentsPage />} />
        <Route path="companies/:companyId/properties/:propertyId/documents/type/:documentType" element={<PropertyDocumentTypePage />} />
        <Route path="companies/:companyId/properties/:propertyId/documents/subtype/:documentSubType" element={<PropertyDocumentSubTypePage />} />
        <Route path="companies/:companyId/documents/archived" element={<CompanyArchivedDocumentsPage />} />
        <Route path="companies/:companyId/documents/archived/type/:documentType" element={<ArchivedDocumentTypePage />} />
        <Route path="companies/:companyId/documents/archived/subtype/:documentSubType" element={<ArchivedDocumentSubTypePage />} />
        <Route path="companies/:id/properties" element={<CompanyPropertiesPage />} />
        <Route path="companies/:id/properties/archived" element={<ArchivedPropertiesPage />} />
        <Route path="companies/:companyId/properties/:propertyId" element={<PropertyDetailPage />} />
        <Route path="tenants/archived" element={<ArchivedTenantsPage />} />
        <Route path="invoices/archived" element={<ArchivedInvoicesPage />} />
        <Route path="documents/archived" element={<ArchivedDocumentsPage />} />
        <Route path="payments/archived" element={<ArchivedPaymentsPage />} />
        <Route path="credit-notes/archived" element={<ArchivedCreditNotesPage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/new" element={<InvoiceCreatePage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId" element={<InvoiceViewPage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId/edit" element={<InvoiceEditPage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId/delete" element={<InvoiceDeletePage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId/documents" element={<InvoiceDocumentsPage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId/documents/type/:documentType" element={<InvoiceDocumentTypePage />} />
        <Route path="companies/:companyId/properties/:propertyId/invoices/:invoiceId/documents/subtype/:documentSubType" element={<InvoiceDocumentSubTypePage />} />
        <Route path="companies/:companyId/properties/:propertyId/documents/:documentId" element={<DocumentViewerPage />} />
        <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
        <Route path="tenants/:tenantId/documents" element={<TenantDocumentsPage />} />
        <Route path="tenants/:tenantId/documents/type/:documentType" element={<TenantDocumentTypePage />} />
        <Route path="tenants/:tenantId/documents/subtype/:documentSubType" element={<TenantDocumentSubTypePage />} />
        <Route path="payments/:paymentId" element={<PaymentDetailPage />} />
        <Route path="payments/:paymentId/documents" element={<PaymentDocumentsPage />} />
        <Route path="payments/:paymentId/documents/type/:documentType" element={<PaymentDocumentTypePage />} />
        <Route path="payments/:paymentId/documents/subtype/:documentSubType" element={<PaymentDocumentSubTypePage />} />
        <Route path="payments/:paymentId/documents/archived" element={<ArchivedPaymentDocumentsPage />} />
        <Route path="payments/:paymentId/documents/archived/type/:documentType" element={<ArchivedPaymentDocumentTypePage />} />
        <Route path="payments/:paymentId/documents/archived/subtype/:documentSubType" element={<ArchivedPaymentDocumentSubTypePage />} />
        <Route path="credit-notes/:creditNoteId" element={<CreditNoteDetailPage />} />
        <Route path="credit-notes/:creditNoteId/documents" element={<CreditNoteDocumentsPage />} />
        <Route path="credit-notes/:creditNoteId/documents/type/:documentType" element={<CreditNoteDocumentTypePage />} />
        <Route path="credit-notes/:creditNoteId/documents/subtype/:documentSubType" element={<CreditNoteDocumentSubTypePage />} />
        <Route path="credit-notes/:creditNoteId/documents/archived" element={<ArchivedCreditNoteDocumentsPage />} />
        <Route path="credit-notes/:creditNoteId/documents/archived/type/:documentType" element={<ArchivedCreditNoteDocumentTypePage />} />
        <Route path="credit-notes/:creditNoteId/documents/archived/subtype/:documentSubType" element={<ArchivedCreditNoteDocumentSubTypePage />} />
        <Route path="rent-reviews/:rentReviewId" element={<RentReviewDetailPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="legal" element={<LegalPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="calendar" element={<CalendarPage />} />

        {/* <Route path="calendar" element={<CalendarAccessPage />} /> */}
        <Route path="tasks" element={<PlaceholderPage title="Tasks" />} />
        <Route path="invoices" element={<PlaceholderPage title="Invoices" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
