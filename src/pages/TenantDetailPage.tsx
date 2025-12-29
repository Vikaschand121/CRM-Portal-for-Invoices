import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Business,
  Visibility,
  Archive,
  People,
  CalendarToday,
  LocationOn,
  MonetizationOn,
  Edit,
  CloudUpload,
  Payment as PaymentIcon,
  Receipt as CreditNoteIcon,
} from '@mui/icons-material';
import { Tenant, Invoice, CreateDocumentPayload, Payment, CreatePaymentPayload, UpdatePaymentPayload, CreditNote, CreateCreditNotePayload, UpdateCreditNotePayload } from '../types';
import { tenantsService } from '../services/tenants.service';
import { invoicesService } from '../services/invoices.service';
import { documentsService } from '../services/documents.service';
import { propertiesService } from '../services/properties.service';
import { formatDate } from '../utils/helpers';
import { useSnackbar } from '../hooks/useSnackbar';

const INVOICE_DOCUMENT_TYPES = [
  'Rent invoices',
  'Rent deposit',
  'Insurance',
  'Credit notes',
  'Service charge',
];

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) {
    return GBP_FORMATTER.format(0);
  }
  return GBP_FORMATTER.format(value);
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-of-type': { borderBottom: 'none' },
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500} sx={{ pl: 2, textAlign: 'right' }}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

export const TenantDetailPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [paymentDocumentDialogOpen, setPaymentDocumentDialogOpen] = useState(false);
  const [creditNoteDocumentDialogOpen, setCreditNoteDocumentDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [creditNoteDialogOpen, setCreditNoteDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [selectedCreditNoteId, setSelectedCreditNoteId] = useState<number | null>(null);
  const [documentForm, setDocumentForm] = useState<CreateDocumentPayload>({
    documentName: '',
    documentType: INVOICE_DOCUMENT_TYPES[0],
    documentSubType: '',
    file: null,
    invoiceId: 0,
  });
  const [paymentDocumentForm, setPaymentDocumentForm] = useState<CreateDocumentPayload>({
    documentName: '',
    documentType: 'Receipts',
    documentSubType: '',
    file: null,
    paymentDetailId: 0,
  });
  const [creditNoteDocumentForm, setCreditNoteDocumentForm] = useState<CreateDocumentPayload>({
    documentName: '',
    documentType: 'Credit notes',
    documentSubType: '',
    file: null,
    creditNoteId: 0,
  });
  const [paymentForm, setPaymentForm] = useState<CreatePaymentPayload>({
    invoiceId: 0,
    invoiceNumber: '',
    paymentDate: '',
    amountReceived: '',
    paymentMethod: '',
  });
  const [creditNoteForm, setCreditNoteForm] = useState<CreateCreditNotePayload>({
    tenantId: 0,
    invoiceId: 0,
    creditNoteDate: '',
    creditNoteAmount: '',
    description: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingCreditNote, setSavingCreditNote] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingPaymentDocument, setUploadingPaymentDocument] = useState(false);
  const [uploadingCreditNoteDocument, setUploadingCreditNoteDocument] = useState(false);
  const [archivePaymentDialogOpen, setArchivePaymentDialogOpen] = useState(false);
  const [paymentToArchive, setPaymentToArchive] = useState<Payment | null>(null);
  const [archivingPayment, setArchivingPayment] = useState(false);
  const [archiveCreditNoteDialogOpen, setArchiveCreditNoteDialogOpen] = useState(false);
  const [creditNoteToArchive, setCreditNoteToArchive] = useState<CreditNote | null>(null);
  const [archivingCreditNote, setArchivingCreditNote] = useState(false);
  const [documentFormErrors, setDocumentFormErrors] = useState({
    documentName: false,
    documentType: false,
    file: false,
  });
  const [paymentDocumentFormErrors, setPaymentDocumentFormErrors] = useState({
    documentName: false,
    documentType: false,
    file: false,
  });
  const [creditNoteDocumentFormErrors, setCreditNoteDocumentFormErrors] = useState({
    documentName: false,
    documentType: false,
    file: false,
  });
  const [paymentFormErrors, setPaymentFormErrors] = useState({
    paymentDate: false,
    amountReceived: false,
    paymentMethod: false,
  });
  const [paymentAmountDisabled, setPaymentAmountDisabled] = useState(false);
  const [creditNoteFormErrors, setCreditNoteFormErrors] = useState({
    creditNoteDate: false,
    creditNoteAmount: false,
    description: false,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!tenantId) {
        setError('Tenant ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const tenantData = await tenantsService.getTenant(parseInt(tenantId));
        setTenant(tenantData);
        const parsedTenantId = parseInt(tenantId, 10);
        const invoiceData = await invoicesService.getInvoicesByTenant(parsedTenantId);
        setInvoices(invoiceData);
        const paymentData = await propertiesService.getPaymentDetails(parsedTenantId);
        setPayments(paymentData);
        const creditNoteData = await propertiesService.getCreditNotes(parsedTenantId);
        setCreditNotes(creditNoteData);
      } catch (err) {
        setError('Failed to load tenant data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tenantId]);


  const handleAddInvoice = () => {
    if (!tenant) return;
    navigate(`/companies/${tenant.property?.company?.id}/properties/${tenant.property?.id || tenant.propertyId}/invoices/new`, {
      state: { tenantId: tenant.id }
    });
  };

  const handleViewInvoice = (invoiceId: number) => {
    if (!tenant) return;
    navigate(`/companies/${tenant.property?.company?.id}/properties/${tenant.property?.id || tenant.propertyId}/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: number) => {
    if (!tenant) return;
    navigate(`/companies/${tenant.property?.company?.id}/properties/${tenant.property?.id || tenant.propertyId}/invoices/${invoiceId}/edit`);
  };

  const handleArchiveInvoice = async (invoiceId: number) => {
    if (window.confirm('Are you sure you want to archive this invoice?')) {
      try {
        await invoicesService.archiveInvoice(invoiceId);
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      } catch (err) {
        setError('Failed to archive invoice');
      }
    }
  };

  const handleUploadInvoiceDocument = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setDocumentForm({
      documentName: '',
      documentType: INVOICE_DOCUMENT_TYPES[0],
      documentSubType: '',
      file: null,
      invoiceId: invoiceId,
    });
    setDocumentFormErrors({
      documentName: false,
      documentType: false,
      file: false,
    });
    setDocumentDialogOpen(true);
  };

  const handleUploadPaymentDocument = (paymentId: number) => {
    setSelectedPaymentId(paymentId);
    setPaymentDocumentForm({
      documentName: '',
      documentType: 'Receipts',
      documentSubType: '',
      file: null,
      paymentDetailId: paymentId,
    });
    setPaymentDocumentFormErrors({
      documentName: false,
      documentType: false,
      file: false,
    });
    setPaymentDocumentDialogOpen(true);
  };

  const handleUploadCreditNoteDocument = (creditNoteId: number) => {
    setSelectedCreditNoteId(creditNoteId);
    setCreditNoteDocumentForm({
      documentName: '',
      documentType: 'Credit notes',
      documentSubType: '',
      file: null,
      creditNoteId: creditNoteId,
    });
    setCreditNoteDocumentFormErrors({
      documentName: false,
      documentType: false,
      file: false,
    });
    setCreditNoteDocumentDialogOpen(true);
  };

  const handleAddPayment = (invoice: Invoice) => {
    const formattedAmount = Number.isFinite(invoice.paymentMade)
      ? invoice.paymentMade.toString()
      : invoice.paymentMade?.toString() || '';
    setPaymentForm({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      paymentDate: '',
      amountReceived: formattedAmount,
      paymentMethod: '',
    });
    setPaymentFormErrors({
      paymentDate: false,
      amountReceived: false,
      paymentMethod: false,
    });
    setPaymentAmountDisabled(true);
    setPaymentDialogOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPaymentId(payment.id);
    setPaymentForm({
      invoiceId: payment.invoiceId,
      invoiceNumber: payment.invoiceNumber,
      paymentDate: payment.paymentDate,
      amountReceived: payment.amountReceived,
      paymentMethod: payment.paymentMethod,
    });
    setPaymentFormErrors({
      paymentDate: false,
      amountReceived: false,
      paymentMethod: false,
    });
    setPaymentAmountDisabled(false);
    setPaymentDialogOpen(true);
  };

  const handleAddCreditNote = (invoice: Invoice) => {
    setCreditNoteForm({
      tenantId: tenant?.id || 0,
      invoiceId: invoice.id,
      creditNoteDate: '',
      creditNoteAmount: '',
      description: '',
    });
    setCreditNoteFormErrors({
      creditNoteDate: false,
      creditNoteAmount: false,
      description: false,
    });
    setCreditNoteDialogOpen(true);
  };

  const handleEditCreditNote = (creditNote: CreditNote) => {
    setSelectedCreditNoteId(creditNote.id);
    setCreditNoteForm({
      tenantId: creditNote.tenantId,
      invoiceId: creditNote.invoiceId,
      creditNoteDate: creditNote.creditNoteDate,
      creditNoteAmount: creditNote.creditNoteAmount,
      description: creditNote.description,
    });
    setCreditNoteFormErrors({
      creditNoteDate: false,
      creditNoteAmount: false,
      description: false,
    });
    setCreditNoteDialogOpen(true);
  };

  const handleViewPayment = (paymentId: number) => {
    navigate(`/payments/${paymentId}`);
  };

  const handleViewCreditNote = (creditNoteId: number) => {
    navigate(`/credit-notes/${creditNoteId}`);
  };

  const handleArchivePayment = (payment: Payment) => {
    setPaymentToArchive(payment);
    setArchivePaymentDialogOpen(true);
  };

  const handleConfirmArchivePayment = async () => {
    if (!paymentToArchive || !tenantId) return;
    setArchivingPayment(true);
    try {
      await propertiesService.archivePayment(paymentToArchive.id);
      showSnackbar('Payment archived successfully', 'success');
      setArchivePaymentDialogOpen(false);
      setPaymentToArchive(null);
      const parsedTenantId = parseInt(tenantId, 10);
      const paymentData = await propertiesService.getPaymentDetails(parsedTenantId);
      setPayments(paymentData);
    } catch (err) {
      showSnackbar('Failed to archive payment', 'error');
    } finally {
      setArchivingPayment(false);
    }
  };

  const handleArchiveCreditNote = (creditNote: CreditNote) => {
    setCreditNoteToArchive(creditNote);
    setArchiveCreditNoteDialogOpen(true);
  };

  const handleConfirmArchiveCreditNote = async () => {
    if (!creditNoteToArchive || !tenantId) return;
    setArchivingCreditNote(true);
    try {
      await propertiesService.archiveCreditNote(creditNoteToArchive.id);
      showSnackbar('Credit note archived successfully', 'success');
      setArchiveCreditNoteDialogOpen(false);
      setCreditNoteToArchive(null);
      const parsedTenantId = parseInt(tenantId, 10);
      const creditNoteData = await propertiesService.getCreditNotes(parsedTenantId);
      setCreditNotes(creditNoteData);
    } catch (err) {
      showSnackbar('Failed to archive credit note', 'error');
    } finally {
      setArchivingCreditNote(false);
    }
  };

  const handleSaveDocument = async () => {
    // Validation
    const errors = {
      documentName: !documentForm.documentName.trim(),
      documentType: !documentForm.documentType.trim(),
      file: !documentForm.file,
    };
    setDocumentFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setUploadingDocument(true);
    try {
      await documentsService.createDocument(documentForm);
      showSnackbar('Document uploaded successfully', 'success');
      setDocumentDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleSavePaymentDocument = async () => {
    // Validation
    const errors = {
      documentName: !paymentDocumentForm.documentName.trim(),
      documentType: !paymentDocumentForm.documentType.trim(),
      file: !paymentDocumentForm.file,
    };
    setPaymentDocumentFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setUploadingPaymentDocument(true);
    try {
      await documentsService.createDocument(paymentDocumentForm);
      showSnackbar('Document uploaded successfully', 'success');
      setPaymentDocumentDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
    } finally {
      setUploadingPaymentDocument(false);
    }
  };

  const handleSaveCreditNoteDocument = async () => {
    // Validation
    const errors = {
      documentName: !creditNoteDocumentForm.documentName.trim(),
      documentType: !creditNoteDocumentForm.documentType.trim(),
      file: !creditNoteDocumentForm.file,
    };
    setCreditNoteDocumentFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setUploadingCreditNoteDocument(true);
    try {
      await documentsService.createDocument(creditNoteDocumentForm);
      showSnackbar('Document uploaded successfully', 'success');
      setCreditNoteDocumentDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
    } finally {
      setUploadingCreditNoteDocument(false);
    }
  };

  const handleSavePayment = async () => {
    // Validation
    const errors = {
      paymentDate: !paymentForm.paymentDate.trim(),
      amountReceived: !paymentForm.amountReceived.trim(),
      paymentMethod: !paymentForm.paymentMethod.trim(),
    };
    setPaymentFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setSavingPayment(true);
    try {
      if (selectedPaymentId) {
        await propertiesService.updatePayment(selectedPaymentId, paymentForm);
        showSnackbar('Payment updated successfully', 'success');
      } else {
        await propertiesService.createPayment(paymentForm);
        showSnackbar('Payment created successfully', 'success');
      }
      setPaymentDialogOpen(false);
      setSelectedPaymentId(null);
      setPaymentAmountDisabled(false);
      // Refresh payments
      if (tenantId) {
        const parsedTenantId = parseInt(tenantId, 10);
        const paymentData = await propertiesService.getPaymentDetails(parsedTenantId);
        setPayments(paymentData);
      }
    } catch (err) {
      showSnackbar('Failed to save payment', 'error');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveCreditNote = async () => {
    // Validation
    const errors = {
      creditNoteDate: !creditNoteForm.creditNoteDate.trim(),
      creditNoteAmount: !creditNoteForm.creditNoteAmount.trim(),
      description: !creditNoteForm.description.trim(),
    };
    setCreditNoteFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setSavingCreditNote(true);
    try {
      if (selectedCreditNoteId) {
        await propertiesService.updateCreditNote(selectedCreditNoteId, creditNoteForm);
        showSnackbar('Credit note updated successfully', 'success');
      } else {
        await propertiesService.createCreditNote(creditNoteForm);
        showSnackbar('Credit note created successfully', 'success');
      }
      setCreditNoteDialogOpen(false);
      setSelectedCreditNoteId(null);
      // Refresh credit notes
      if (tenantId) {
        const parsedTenantId = parseInt(tenantId, 10);
        const creditNoteData = await propertiesService.getCreditNotes(parsedTenantId);
        setCreditNotes(creditNoteData);
      }
    } catch (err) {
      showSnackbar('Failed to save credit note', 'error');
    } finally {
      setSavingCreditNote(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  if (!tenant) {
    return null;
  }

  const summaryCards = [
    {
      label: 'Annual Rent',
      value: formatCurrency(parseFloat(tenant.aggreedAnnualRent || '0')),
      helper: 'Agreed Annual Rent',
      icon: MonetizationOn,
    },
    {
      label: 'Net Amount',
      value: formatCurrency(parseFloat(tenant.netAmount || '0')),
      helper: tenant.rentPaymentFrequency === 'MONTHLY' ? 'Monthly' : 'Quarterly',
      icon: MonetizationOn,
    },
    {
      label: 'Invoices',
      value: invoices.length.toString(),
      helper: 'Total Invoices',
      icon: Business,
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{
        mt: { xs: 1, sm: 1.5 },
        mb: { xs: 3, sm: 4 },
        px: { xs: 1, sm: 2, md: 0 }
      }}>
        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 3,
            mb: 3,
            color: 'white',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.1,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 },
              mb: { xs: 2, md: 3 }
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                mb: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar
                  sx={{
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <People sx={{ fontSize: { xs: 28, sm: 32 } }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    fontWeight={800}
                    sx={{
                      mb: 0.5,
                      fontSize: { xs: '1.8rem', sm: '2.125rem', md: '3rem' }
                    }}
                  >
                    {tenant.tenantName}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {tenant.property?.propertyName || 'Property'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 1,
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'center', md: 'flex-end' }
              }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/companies/${tenant?.property?.company?.id}/properties/${tenant?.property?.id}`)}
                  sx={{
                    mb: { xs: 0, md: 2 },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: '200px', sm: 'auto' },
                  }}
                >
                  Back to Invoices
                </Button>
              </Box>
            </Box>

            {/* Key Metrics in Hero */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(3, 1fr)'
                },
                gap: { xs: 1.5, sm: 2 },
                mt: 2,
              }}
            >
              {summaryCards.map(({ label, value, helper, icon: Icon }) => (
                <Box
                  key={label}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {label}
                    </Typography>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    {value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {helper}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: '1fr 1fr',
            lg: '1fr 1fr'
          },
          gap: { xs: 2, sm: 2.5 },
        }}>
          <Card
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 32px 64px rgba(15, 23, 42, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'white',
                  }}
                >
                  <People fontSize="small" />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                  Tenant Information
                </Typography>
              </Box>
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <InfoRow label="Tenant Name" value={tenant.tenantName} />
                <InfoRow label="Contact" value={tenant.tenantContact} />
                <InfoRow label="Email" value={tenant.tenantEmail} />
                <InfoRow label="Address" value={tenant.tenantCorrespondingAddress} />
                <InfoRow label="Lease Start" value={formatDate(tenant.leaseStartDate)} />
                <InfoRow label="Lease End" value={formatDate(tenant.leaseEndDate)} />
                <InfoRow label="Rent Review Dates" value={tenant.rentReviewDates} />
                <InfoRow label="Break Date" value={tenant.breakDate ? formatDate(tenant.breakDate) : 'None'} />
                <InfoRow label="Rent Start Date" value={formatDate(tenant.rentStartDate)} />
                <InfoRow label="Payment Frequency" value={tenant.rentPaymentFrequency} />
                <InfoRow label="VAT Registered" value={tenant.isVatRegistered ? 'Yes' : 'No'} />
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 32px 64px rgba(15, 23, 42, 0.15)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'warning.main',
                    color: 'white',
                  }}
                >
                  <Business fontSize="small" />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main' }}>
                  Property Details
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'warning.100' } }}>
                  <Typography variant="body2" color="warning.800" fontWeight={600}>
                    Property Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {tenant.property?.propertyName}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'warning.100' } }}>
                  <Typography variant="body2" color="warning.800" fontWeight={600}>
                    Property Type
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {tenant.property?.propertyType}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'warning.100' } }}>
                  <Typography variant="body2" color="warning.800" fontWeight={600}>
                    Property Value
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatCurrency(tenant.property?.propertyValue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>


        {/* Invoices Section */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Invoices</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddInvoice}>
              Add Invoice
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'success.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Number</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.isArchived ? 'Archived' : 'Active'}
                        color={invoice.isArchived ? 'default' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Invoice">
                        <IconButton onClick={() => handleViewInvoice(invoice.id)} sx={{ color: 'primary.main' }}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Invoice">
                        <IconButton onClick={() => handleEditInvoice(invoice.id)} sx={{ color: 'secondary.main' }}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Payment">
                        <IconButton onClick={() => handleAddPayment(invoice)} sx={{ color: 'success.main' }}>
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Credit Note">
                        <IconButton onClick={() => handleAddCreditNote(invoice)} sx={{ color: 'error.main' }}>
                          <CreditNoteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Upload Document">
                        <IconButton onClick={() => handleUploadInvoiceDocument(invoice.id)} sx={{ color: 'info.main' }}>
                          <CloudUpload />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archive Invoice">
                        <IconButton onClick={() => handleArchiveInvoice(invoice.id)} sx={{ color: 'warning.main' }}>
                          <Archive />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Payments Section */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Payments</Typography>
            <Button
              variant="text"
              startIcon={<Archive />}
              onClick={() => navigate('/payments/archived', { state: { fromTenant: tenant?.id } })}
            >
              View Archived
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'success.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Number</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Payment Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount Received</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Payment Method</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(payment.amountReceived))}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <Tooltip title="View Payment">
                        <IconButton onClick={() => handleViewPayment(payment.id)} sx={{ color: 'primary.main' }}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Payment">
                        <IconButton onClick={() => handleEditPayment(payment)} sx={{ color: 'secondary.main' }}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Upload Document">
                        <IconButton onClick={() => handleUploadPaymentDocument(payment.id)} sx={{ color: 'info.main' }}>
                          <CloudUpload />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archive Payment">
                        <IconButton onClick={() => handleArchivePayment(payment)} sx={{ color: 'warning.main' }}>
                          <Archive />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Credit Notes Section */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Credit Notes</Typography>
            <Button
              variant="text"
              startIcon={<Archive />}
              onClick={() => navigate('/credit-notes/archived', { state: { fromTenant: tenant?.id } })}
            >
              View Archived
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'error.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Number</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Credit Note Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Credit Note Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {creditNotes.map((creditNote) => (
                  <TableRow key={creditNote.id}>
                    <TableCell>{creditNote.invoiceNumber}</TableCell>
                    <TableCell>{new Date(creditNote.creditNoteDate).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(creditNote.creditNoteAmount))}</TableCell>
                    <TableCell>{creditNote.description}</TableCell>
                    <TableCell>
                      <Tooltip title="View Credit Note">
                        <IconButton onClick={() => handleViewCreditNote(creditNote.id)} sx={{ color: 'primary.main' }}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Credit Note">
                        <IconButton onClick={() => handleEditCreditNote(creditNote)} sx={{ color: 'secondary.main' }}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Upload Document">
                        <IconButton onClick={() => handleUploadCreditNoteDocument(creditNote.id)} sx={{ color: 'info.main' }}>
                          <CloudUpload />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archive Credit Note">
                        <IconButton onClick={() => handleArchiveCreditNote(creditNote)} sx={{ color: 'warning.main' }}>
                          <Archive />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Document Upload Dialog */}
        <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Upload Document for Invoice {invoices.find(inv => inv.id === selectedInvoiceId)?.invoiceNumber}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Document Name"
                value={documentForm.documentName}
                onChange={(e) => setDocumentForm({ ...documentForm, documentName: e.target.value })}
                fullWidth
                required
                error={documentFormErrors.documentName}
                helperText={documentFormErrors.documentName ? "* required" : ""}
              />
              <TextField
                select
                label="Document Type"
                value={documentForm.documentType}
                onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                fullWidth
                required
                error={documentFormErrors.documentType}
                helperText={documentFormErrors.documentType ? "* required" : ""}
              >
                {INVOICE_DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <input
                type="file"
                onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocumentDialogOpen(false)} disabled={uploadingDocument}>Cancel</Button>
            <Button onClick={handleSaveDocument} variant="contained" disabled={uploadingDocument}>
              {uploadingDocument ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog
          open={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setPaymentAmountDisabled(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedPaymentId ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Tenant Name"
                value={tenant?.tenantName || ''}
                InputProps={{ readOnly: true }}
                fullWidth
                disabled
              />
              <TextField
                label="Invoice Number"
                value={paymentForm.invoiceNumber}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Payment Date"
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                fullWidth
                required
                error={paymentFormErrors.paymentDate}
                helperText={paymentFormErrors.paymentDate ? "* required" : ""}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Amount Received"
                value={paymentForm.amountReceived}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountReceived: e.target.value })}
                disabled={paymentAmountDisabled}
                fullWidth
                required
                error={paymentFormErrors.amountReceived}
                helperText={paymentFormErrors.amountReceived ? "* required" : ""}
              />
              <TextField
                select
                label="Payment Method"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                fullWidth
                required
                error={paymentFormErrors.paymentMethod}
                helperText={paymentFormErrors.paymentMethod ? "* required" : ""}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="PayPal">PayPal</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setPaymentDialogOpen(false); setPaymentAmountDisabled(false); }} disabled={savingPayment}>Cancel</Button>
            <Button onClick={handleSavePayment} variant="contained" disabled={savingPayment}>
              {savingPayment ? 'Saving...' : selectedPaymentId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Credit Note Dialog */}
        <Dialog open={creditNoteDialogOpen} onClose={() => setCreditNoteDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedCreditNoteId ? 'Edit Credit Note' : 'Add Credit Note'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Tenant Name"
                value={tenant?.tenantName || ''}
                InputProps={{ readOnly: true }}
                fullWidth
                disabled
              />
              <TextField
                label="Invoice Number"
                value={invoices.find(inv => inv.id === creditNoteForm.invoiceId)?.invoiceNumber || ''}
                InputProps={{ readOnly: true }}
                fullWidth
                disabled
              />
              <TextField
                label="Credit Note Date"
                type="date"
                value={creditNoteForm.creditNoteDate}
                onChange={(e) => setCreditNoteForm({ ...creditNoteForm, creditNoteDate: e.target.value })}
                fullWidth
                required
                error={creditNoteFormErrors.creditNoteDate}
                helperText={creditNoteFormErrors.creditNoteDate ? "* required" : ""}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Credit Note Amount"
                value={creditNoteForm.creditNoteAmount}
                onChange={(e) => setCreditNoteForm({ ...creditNoteForm, creditNoteAmount: e.target.value })}
                fullWidth
                required
                error={creditNoteFormErrors.creditNoteAmount}
                helperText={creditNoteFormErrors.creditNoteAmount ? "* required" : ""}
              />
              <TextField
                label="Description"
                value={creditNoteForm.description}
                onChange={(e) => setCreditNoteForm({ ...creditNoteForm, description: e.target.value })}
                fullWidth
                required
                error={creditNoteFormErrors.description}
                helperText={creditNoteFormErrors.description ? "* required" : ""}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreditNoteDialogOpen(false)} disabled={savingCreditNote}>Cancel</Button>
            <Button onClick={handleSaveCreditNote} variant="contained" disabled={savingCreditNote}>
              {savingCreditNote ? 'Saving...' : selectedCreditNoteId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Document Upload Dialog */}
        <Dialog open={paymentDocumentDialogOpen} onClose={() => setPaymentDocumentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Upload Document for Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Document Name"
                value={paymentDocumentForm.documentName}
                onChange={(e) => setPaymentDocumentForm({ ...paymentDocumentForm, documentName: e.target.value })}
                fullWidth
                required
                error={paymentDocumentFormErrors.documentName}
                helperText={paymentDocumentFormErrors.documentName ? "* required" : ""}
              />
              <TextField
                select
                label="Document Type"
                value={paymentDocumentForm.documentType}
                onChange={(e) => setPaymentDocumentForm({ ...paymentDocumentForm, documentType: e.target.value })}
                fullWidth
                required
                error={paymentDocumentFormErrors.documentType}
                helperText={paymentDocumentFormErrors.documentType ? "* required" : ""}
              >
                <MenuItem value="Receipts">Receipts</MenuItem>
                <MenuItem value="Bank statements">Bank statements</MenuItem>
                <MenuItem value="Payment confirmations">Payment confirmations</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <input
                type="file"
                onChange={(e) => setPaymentDocumentForm({ ...paymentDocumentForm, file: e.target.files?.[0] || null })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDocumentDialogOpen(false)} disabled={uploadingPaymentDocument}>Cancel</Button>
            <Button onClick={handleSavePaymentDocument} variant="contained" disabled={uploadingPaymentDocument}>
              {uploadingPaymentDocument ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Credit Note Document Upload Dialog */}
        <Dialog open={creditNoteDocumentDialogOpen} onClose={() => setCreditNoteDocumentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Upload Document for Credit Note</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Document Name"
                value={creditNoteDocumentForm.documentName}
                onChange={(e) => setCreditNoteDocumentForm({ ...creditNoteDocumentForm, documentName: e.target.value })}
                fullWidth
                required
                error={creditNoteDocumentFormErrors.documentName}
                helperText={creditNoteDocumentFormErrors.documentName ? "* required" : ""}
              />
              <TextField
                select
                label="Document Type"
                value={creditNoteDocumentForm.documentType}
                onChange={(e) => setCreditNoteDocumentForm({ ...creditNoteDocumentForm, documentType: e.target.value })}
                fullWidth
                required
                error={creditNoteDocumentFormErrors.documentType}
                helperText={creditNoteDocumentFormErrors.documentType ? "* required" : ""}
              >
                <MenuItem value="Credit notes">Credit notes</MenuItem>
                <MenuItem value="Adjustment letters">Adjustment letters</MenuItem>
                <MenuItem value="Refund confirmations">Refund confirmations</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <input
                type="file"
                onChange={(e) => setCreditNoteDocumentForm({ ...creditNoteDocumentForm, file: e.target.files?.[0] || null })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreditNoteDocumentDialogOpen(false)} disabled={uploadingCreditNoteDocument}>Cancel</Button>
            <Button onClick={handleSaveCreditNoteDocument} variant="contained" disabled={uploadingCreditNoteDocument}>
              {uploadingCreditNoteDocument ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Archive Payment Dialog */}
        <Dialog open={archivePaymentDialogOpen} onClose={() => setArchivePaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Archive Payment</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to archive this payment? This action can be undone by restoring it from the archived payments.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setArchivePaymentDialogOpen(false)} disabled={archivingPayment}>
              Cancel
            </Button>
            <Button onClick={handleConfirmArchivePayment} variant="contained" color="error" disabled={archivingPayment}>
              {archivingPayment ? 'Archiving...' : 'Archive'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Archive Credit Note Dialog */}
        <Dialog open={archiveCreditNoteDialogOpen} onClose={() => setArchiveCreditNoteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Archive Credit Note</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to archive this credit note? This action can be undone by restoring it from the archived credit notes.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setArchiveCreditNoteDialogOpen(false)} disabled={archivingCreditNote}>
              Cancel
            </Button>
            <Button onClick={handleConfirmArchiveCreditNote} variant="contained" color="error" disabled={archivingCreditNote}>
              {archivingCreditNote ? 'Archiving...' : 'Archive'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TenantDetailPage;
