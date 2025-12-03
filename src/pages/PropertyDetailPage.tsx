import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  Archive,
  ArrowBack,
  Business,
  CalendarToday,
  CloudUpload,
  Delete,
  Description,
  Edit,
  History,
  HomeWork,
  LocationOn,
  MonetizationOn,
  People,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import {
  Property,
  Tenant,
  Document,
  Invoice,
  CreateTenantPayload,
  CreateDocumentPayload,
  RentPaymentFrequency,
} from '../types';
import { propertiesService } from '../services/properties.service';
import { tenantsService } from '../services/tenants.service';
import { documentsService } from '../services/documents.service';
import { invoicesService } from '../services/invoices.service';
import { useSnackbar } from '../hooks/useSnackbar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { getQuarterRange } from '../utils/quarter';

const COMPANY_DOCUMENT_TYPES = [
  'Company Incorporation Certificate',
  'Company Confirmation Statement',
  'Company Vat Certificate',
];

const CONFIRMATION_STATEMENT_START_YEAR = 2021;
const CONFIRMATION_STATEMENT_YEARS = Array.from(
  { length: new Date().getFullYear() - CONFIRMATION_STATEMENT_START_YEAR + 1 },
  (_, index) => (CONFIRMATION_STATEMENT_START_YEAR + index).toString()
);

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

const RENT_PAYMENT_FREQUENCY_OPTIONS: { value: RentPaymentFrequency; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
];

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-of-type': {
        borderBottom: 'none',
      },
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

export const PropertyDetailPage = () => {
  const { companyId, propertyId } = useParams<{ companyId: string; propertyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm, setTenantForm] = useState<CreateTenantPayload>({
    tenantName: '',
    propertyId: parseInt(propertyId || '0'),
    leaseStartDate: '',
    leaseEndDate: '',
    rentReviewDates: '',
    isReviewedDates: true,
    isVatRegistered: false,
    rentPaymentFrequency: 'MONTHLY' as RentPaymentFrequency,
    tenantEmail: '',
    tenantContact: '',
    tenantCorrespondingAddress: '',
    breakDate: '',
    rentStartDate: '',
    aggreedAnnualRent: undefined,
    netAmount: undefined,
  });
  const [tenantFormErrors, setTenantFormErrors] = useState({
    tenantName: false,
    leaseStartDate: false,
    leaseEndDate: false,
    rentReviewDates: false,
    breakDate: false,
  });
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState<CreateDocumentPayload>({
    documentName: '',
    documentType: COMPANY_DOCUMENT_TYPES[0],
    documentSubType: '',
    file: null,
    propertyId: parseInt(propertyId || '0'),
    companyId: parseInt(companyId || '0'),
  });

  const loadData = async () => {
    if (!propertyId) {
      setError('Property id is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const allProperties = await propertiesService.getProperties();
      const foundProperty = allProperties.find(p => p.id === parseInt(propertyId));
      if (foundProperty) {
        setProperty(foundProperty);
        // Load dynamic data
        const tenantData = await tenantsService.getTenants(parseInt(propertyId));
        setTenants(tenantData);
        const documentData = await documentsService.getDocuments(parseInt(propertyId));
        setDocuments(documentData);
        const invoiceData = await invoicesService.getInvoices(parseInt(propertyId));
        setInvoices(invoiceData);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyId]);

  useEffect(() => {
    if (location.state?.tab === 'documents') {
      setTabValue(2); // Documents tab
    } else if (location.state?.tab === 'invoices') {
      setTabValue(3); // Invoices tab
    }
  }, [location.state]);

  useEffect(() => {
    const netAmount = calculateNetAmount(tenantForm.aggreedAnnualRent, tenantForm.rentPaymentFrequency);
    setTenantForm(prev => ({ ...prev, netAmount }));
  }, [tenantForm.aggreedAnnualRent, tenantForm.rentPaymentFrequency]);

  useEffect(() => {
    let filtered = invoices;

    if (filterStatus) {
      filtered = filtered.filter(invoice => {
        const balance = parseFloat(invoice.balanceDue || '0');
        if (filterStatus === 'paid') return balance === 0;
        if (filterStatus === 'unpaid') return balance === invoice.totalAmount;
        if (filterStatus === 'partial') return balance > 0 && balance < invoice.totalAmount;
        return true;
      });
    }

    setFilteredInvoices(filtered);
  }, [invoices, filterStatus]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

const calculateNetAmount = (annualRent?: string, frequency?: RentPaymentFrequency): string => {
  if (!annualRent || !frequency) return '';
  const rent = parseFloat(annualRent);
  if (isNaN(rent)) return '';
  if (frequency === 'MONTHLY') return (rent / 12).toFixed(0);
  if (frequency === 'QUARTERLY') return (rent / 4).toFixed(0);
  return '';
};

const normalizeTenantPayload = (form: CreateTenantPayload): CreateTenantPayload => {
  if (form.rentPaymentFrequency !== 'QUARTERLY' || !form.rentStartDate) {
    return form;
  }
  const quarterRange = getQuarterRange(form.rentStartDate);
  if (!quarterRange.start) {
    return form;
  }
  return { ...form, rentStartDate: quarterRange.start };
};

  // Tenant handlers
  const handleAddTenant = () => {
    setEditingTenant(null);
    setTenantForm({
      tenantName: '',
      propertyId: parseInt(propertyId || '0'),
      leaseStartDate: '',
      leaseEndDate: '',
      rentReviewDates: '',
      isReviewedDates: true,
      isVatRegistered: false,
      rentPaymentFrequency: 'MONTHLY' as RentPaymentFrequency,
      tenantEmail: '',
      tenantContact: '',
      tenantCorrespondingAddress: '',
      breakDate: '',
      rentStartDate: '',
      aggreedAnnualRent: undefined,
      netAmount: undefined,
      previousBalance: undefined,
    });
    setTenantFormErrors({
      tenantName: false,
      leaseStartDate: false,
      leaseEndDate: false,
      rentReviewDates: false,
      breakDate: false,
    });
    setTenantDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setTenantForm({
      tenantName: tenant.tenantName,
      propertyId: tenant.propertyId,
      leaseStartDate: tenant.leaseStartDate,
      leaseEndDate: tenant.leaseEndDate,
      rentReviewDates: tenant.rentReviewDates,
      isReviewedDates: tenant.isReviewedDates,
      isVatRegistered: tenant.isVatRegistered,
      rentPaymentFrequency: tenant.rentPaymentFrequency,
      tenantEmail: tenant.tenantEmail,
      tenantContact: tenant.tenantContact,
      tenantCorrespondingAddress: tenant.tenantCorrespondingAddress,
      breakDate: tenant.breakDate,
      rentStartDate: tenant.rentStartDate,
      aggreedAnnualRent: tenant.aggreedAnnualRent,
      netAmount: tenant.netAmount,
      previousBalance: tenant.previousBalance,
    });
    setTenantFormErrors({
      tenantName: false,
      leaseStartDate: false,
      leaseEndDate: false,
      rentReviewDates: false,
      breakDate: false,
    });
    setTenantDialogOpen(true);
  };

  const handleArchiveTenant = async (id: number) => {
    if (window.confirm('Are you sure you want to archive this tenant?')) {
      try {
        await tenantsService.archiveTenant(id);
        showSnackbar('Tenant archived successfully', 'success');
        loadData();
      } catch (err) {
        showSnackbar('Failed to archive tenant', 'error');
      }
    }
  };

  const handleSaveTenant = async () => {
    // Validation
    const errors = {
      tenantName: !tenantForm.tenantName.trim(),
      leaseStartDate: !tenantForm.leaseStartDate,
      leaseEndDate: !tenantForm.leaseEndDate,
      rentReviewDates: !tenantForm.rentReviewDates.trim(),
      breakDate: !tenantForm.breakDate,
    };
    setTenantFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      showSnackbar('Please fill in all required fields.', 'error');
      return;
    }

    try {
      const payload = normalizeTenantPayload(tenantForm);
      if (editingTenant) {
        await tenantsService.updateTenant(editingTenant.id, payload);
        showSnackbar('Tenant updated successfully', 'success');
      } else {
        await tenantsService.createTenant(payload);
        showSnackbar('Tenant created successfully', 'success');
      }
      setTenantDialogOpen(false);
      loadData();
    } catch (err) {
      showSnackbar('Failed to save tenant', 'error');
    }
  };

  // Document handlers
  const handleAddDocument = () => {
    setDocumentForm({
      documentName: '',
      documentType: COMPANY_DOCUMENT_TYPES[0],
      documentSubType: '',
      file: null,
      propertyId: parseInt(propertyId || '0'),
      companyId: parseInt(companyId || '0'),
    });
    setDocumentDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocumentId) return;
    try {
      await documentsService.deleteDocument(deleteDocumentId);
      showSnackbar('Document deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setDeleteDocumentId(null);
      loadData();
    } catch (err) {
      showSnackbar('Failed to delete document', 'error');
    }
  };

  const handleArchiveDocument = async (documentId: number) => {
    if (window.confirm('Are you sure you want to archive this document?')) {
      try {
        await documentsService.archiveDocument(documentId);
        showSnackbar('Document archived successfully', 'success');
        loadData();
      } catch (err) {
        showSnackbar('Failed to archive document', 'error');
      }
    }
  };

  const handleSaveDocument = async () => {
    // Validation
    if (!documentForm.documentName.trim()) {
      showSnackbar('Document name is required', 'error');
      return;
    }
    if (!documentForm.documentType.trim()) {
      showSnackbar('Document type is required', 'error');
      return;
    }
    if (
      documentForm.documentType === 'Company Confirmation Statement' &&
      !documentForm.documentSubType
    ) {
      showSnackbar('Please select a year for the confirmation statement', 'error');
      return;
    }
    if (!documentForm.file) {
      showSnackbar('Please select a file to upload', 'error');
      return;
    }

    try {
      await documentsService.createDocument(documentForm);
      showSnackbar('Document uploaded successfully', 'success');
      setDocumentDialogOpen(false);
      loadData();
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
    }
  };

  // Invoice handlers
  const handleAddInvoice = () => {
    navigate(`/companies/${companyId}/properties/${propertyId}/invoices/new`);
  };

  const handleViewInvoice = (invoiceId: number) => {
    navigate(`/companies/${companyId}/properties/${propertyId}/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: number) => {
    navigate(`/companies/${companyId}/properties/${propertyId}/invoices/${invoiceId}/edit`);
  };

  const handleArchiveInvoice = async (invoiceId: number) => {
    if (window.confirm('Are you sure you want to archive this invoice?')) {
      try {
        await invoicesService.archiveInvoice(invoiceId);
        showSnackbar('Invoice archived successfully', 'success');
        loadData();
      } catch (err) {
        showSnackbar('Failed to archive invoice', 'error');
      }
    }
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    navigate(`/companies/${companyId}/properties/${propertyId}/invoices/${invoiceId}/delete`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Loading property details...
            </Typography>
          </Paper>
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
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/companies/${companyId}/properties`)}>
          Back to Properties
        </Button>
      </Container>
    );
  }

  if (!property) {
    return null;
  }

  const summaryCards = [
    {
      label: 'Property Value',
      value: formatCurrency(property.propertyValue),
      helper: 'Current Market Value',
      icon: AccountBalance,
    },
    {
      label: 'Rental Income',
      value: formatCurrency(property.rentalIncomePerAnnum),
      helper: 'Annual Rental Income',
      icon: MonetizationOn,
    },
    {
      label: 'Active Tenants',
      value: tenants.length.toString(),
      helper: 'Current Tenants',
      icon: People,
    },
    {
      label: 'Invoices',
      value: invoices.length.toString(),
      helper: 'Total Invoices',
      icon: ReceiptLongIcon,
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
                  <HomeWork sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    {property.propertyName}
                  </Typography>
                  <Chip
                    label={property.propertyType}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  />
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
                  onClick={() => navigate(`/companies/${companyId}/properties`)}
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
                  Back to Properties
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
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(4, 1fr)'
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="property tabs">
            <Tab label="Overview" />
            <Tab label="Tenants" />
            <Tab label="Documents" />
            <Tab label="Invoices" />
          </Tabs>
        </Box>

      {tabValue === 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 2,
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr',
                md: '1fr 1fr',
                lg: '1fr 1fr'
              },
              gap: { xs: 2, sm: 2.5 },
            }}
          >
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
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
                  Property Information
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <InfoRow label="Property Type" value={property.propertyType} />
                  <InfoRow label="Property Value" value={formatCurrency(property.propertyValue)} />
                  <InfoRow label="Rental Income" value={formatCurrency(property.rentalIncomePerAnnum)} />
                  <InfoRow label="Description" value={property.description} />
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
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    <Business fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                    Company Details
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'primary.100' } }}>
                    <Typography variant="body2" color="primary.800" fontWeight={600}>
                      Company Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.company.name}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'primary.100' } }}>
                    <Typography variant="body2" color="primary.800" fontWeight={600}>
                      Company Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {property.company.companyNumber}
                    </Typography>
                  </Box>
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
                    <LocationOn fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main' }}>
                    Property Address
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                  Full Address
                </Typography>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                    {property.propertyAddress}
                  </Typography>
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
                      bgcolor: 'success.main',
                      color: 'white',
                    }}
                  >
                    <CalendarToday fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main' }}>
                    Timestamps
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Created
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(property.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Last Updated
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(property.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Tenants</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => navigate('/tenants/archived', { state: { fromProperty: propertyId, fromCompany: companyId, tab: 'tenants' } })}
              >
                View Archived
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddTenant}>
                Add Tenant
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tenant Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lease Start Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lease End Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rent Review Dates</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Break Date</TableCell>
                  {/* <TableCell sx={{ color: 'white', fontWeight: 600 }}>VAT Available</TableCell> */}
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.tenantName}</TableCell>
                    <TableCell>{new Date(tenant.leaseStartDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(tenant.leaseEndDate).toLocaleDateString()}</TableCell>
                    <TableCell>{tenant.rentReviewDates}</TableCell>
                    <TableCell>{tenant.breakDate && !isNaN(new Date(tenant.breakDate).getTime()) ? new Date(tenant.breakDate).toLocaleDateString() : tenant.breakDate || 'N/A'}</TableCell>
                    {/* <TableCell>{tenant.isVatAvailable ? 'Yes' : 'No'}</TableCell> */}
                    <TableCell>
                      <IconButton onClick={() => handleEditTenant(tenant)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleArchiveTenant(tenant.id)}>
                        <Archive />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Documents</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => navigate('/documents/archived', { state: { fromProperty: propertyId, fromCompany: companyId, tab: 'documents' } })}
              >
                View Archived
              </Button>
              <Button variant="contained" startIcon={<CloudUpload />} onClick={handleAddDocument}>
                Upload Document
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            {documents.map((doc) => (
              <Card
                key={doc.id}
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
                        bgcolor: 'secondary.main',
                        color: 'white',
                      }}
                    >
                      <Description fontSize="small" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'secondary.main' }}>
                      {doc.documentName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'secondary.100' } }}>
                      <Typography variant="body2" color="secondary.800" fontWeight={600}>
                        Type
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {doc.documentType}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'secondary.100' } }}>
                      <Typography variant="body2" color="secondary.800" fontWeight={600}>
                        Uploaded
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton onClick={() => handleArchiveDocument(doc.id)} sx={{ color: 'warning.main' }}>
                      <Archive />
                    </IconButton>
                    <IconButton onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}/documents/${doc.id}`)} sx={{ color: 'primary.main' }}>
                      <Visibility />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {tabValue === 3 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="h6">Invoices</Typography>
                <TextField
                  label="Status"
                  select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                </TextField>
</Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => navigate('/invoices/archived', { state: { fromProperty: propertyId, fromCompany: companyId, tab: 'invoices' } })}
              >
                View Archived
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddInvoice}>
                Add Invoice
              </Button>
             
            </Box>
          </Box>

          {/* Filters */}
      
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'success.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Number</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewInvoice(invoice.id)}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEditInvoice(invoice.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleArchiveInvoice(invoice.id)}>
                        <Archive />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      </Box>

      {/* Tenant Dialog */}
      <Dialog open={tenantDialogOpen} onClose={() => setTenantDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tenant Name"
              value={tenantForm.tenantName}
              onChange={(e) => setTenantForm({ ...tenantForm, tenantName: e.target.value })}
              fullWidth
              required
              error={tenantFormErrors.tenantName}
              helperText={tenantFormErrors.tenantName ? "* required" : ""}
            />
            <TextField
              label="Lease Start Date"
              type="date"
              value={tenantForm.leaseStartDate}
              onChange={(e) => setTenantForm({ ...tenantForm, leaseStartDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
              error={tenantFormErrors.leaseStartDate}
              helperText={tenantFormErrors.leaseStartDate ? "* required" : ""}
            />
            <TextField
              label="Lease End Date"
              type="date"
              value={tenantForm.leaseEndDate}
              onChange={(e) => setTenantForm({ ...tenantForm, leaseEndDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
              error={tenantFormErrors.leaseEndDate}
              helperText={tenantFormErrors.leaseEndDate ? "* required" : ""}
            />
            <TextField
              label="Rent Review Dates"
              value={tenantForm.rentReviewDates}
              onChange={(e) => setTenantForm({ ...tenantForm, rentReviewDates: e.target.value })}
              fullWidth
              required
              error={tenantFormErrors.rentReviewDates}
              helperText={tenantFormErrors.rentReviewDates ? "* required" : ""}
            />
            <TextField
              label="Break Date"
              // type="date"
              value={tenantForm.breakDate}
              onChange={(e) => setTenantForm({ ...tenantForm, breakDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              // required
              // error={tenantFormErrors.breakDate}
              // helperText={tenantFormErrors.breakDate ? "* required" : ""}
            />
            {/* <TextField
              label="Lender Name"
              value={tenantForm.lenderName}
              onChange={(e) => setTenantForm({ ...tenantForm, lenderName: e.target.value })}
              fullWidth
              // required
              // error={tenantFormErrors.lenderName}
              // helperText={tenantFormErrors.lenderName ? "* required" : ""}
            /> */}
            <TextField
              label="Agreed Annual Rent"
              value={tenantForm.aggreedAnnualRent || ''}
              onChange={(e) => setTenantForm({ ...tenantForm, aggreedAnnualRent: e.target.value || undefined })}
              fullWidth
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>£</Typography> }}
            />
            <TextField
              label="Rent Payment Frequency"
              select
              value={tenantForm.rentPaymentFrequency}
              onChange={(e) => setTenantForm({ ...tenantForm, rentPaymentFrequency: e.target.value as RentPaymentFrequency })}
              fullWidth
              required
            >
              {RENT_PAYMENT_FREQUENCY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Net Amount"
              value={tenantForm.netAmount || ''}
              fullWidth
              disabled
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>£</Typography> }}
            />
            <TextField
              label="Tenant Email"
              type="email"
              value={tenantForm.tenantEmail}
              onChange={(e) => setTenantForm({ ...tenantForm, tenantEmail: e.target.value })}
              fullWidth
            />
            <TextField
              label="Tenant Contact"
              value={tenantForm.tenantContact}
              onChange={(e) => setTenantForm({ ...tenantForm, tenantContact: e.target.value })}
              fullWidth
            />
            <TextField
              label="Tenant Corresponding Address"
              value={tenantForm.tenantCorrespondingAddress}
              onChange={(e) => setTenantForm({ ...tenantForm, tenantCorrespondingAddress: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Rent Start Date"
              type="date"
              value={tenantForm.rentStartDate}
              onChange={(e) => setTenantForm({ ...tenantForm, rentStartDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Previous Balance"
              type="number"
              value={tenantForm.previousBalance || ''}
              onChange={(e) => setTenantForm({ ...tenantForm, previousBalance: e.target.value ? parseFloat(e.target.value) : undefined })}
              fullWidth
              disabled={!editingTenant}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>£</Typography> }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tenantForm.isReviewedDates}
                  onChange={(e) => setTenantForm({ ...tenantForm, isReviewedDates: e.target.checked })}
                  color="primary"
                />
              }
              label="Is Reviewed Dates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tenantForm.isVatRegistered}
                  onChange={(e) => setTenantForm({ ...tenantForm, isVatRegistered: e.target.checked })}
                  color="primary"
                />
              }
              label="Is VAT Registered"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTenantDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTenant} variant="contained">
            {editingTenant ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Dialog */}
      <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Document Name"
              value={documentForm.documentName}
              onChange={(e) => setDocumentForm({ ...documentForm, documentName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Document Type"
              value={documentForm.documentType}
              onChange={(e) =>
                setDocumentForm((prev) => ({
                  ...prev,
                  documentType: e.target.value,
                  documentSubType: e.target.value === 'Company Confirmation Statement' ? prev.documentSubType : '',
                }))
              }
              fullWidth
              required
            >
              {COMPANY_DOCUMENT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            {documentForm.documentType === 'Company Confirmation Statement' && (
              <TextField
                select
                label="Statement Year"
                value={documentForm.documentSubType}
                onChange={(e) =>
                  setDocumentForm((prev) => ({ ...prev, documentSubType: e.target.value }))
                }
                fullWidth
                required
              >
                <MenuItem value="">Select a year</MenuItem>
                {CONFIRMATION_STATEMENT_YEARS.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Tenant"
              select
              value={documentForm.tenantId ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setDocumentForm({ ...documentForm, tenantId: value === '' ? undefined : parseInt(value, 10) });
              }}
              fullWidth
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.tenantName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Invoice"
              select
              value={documentForm.invoiceId ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setDocumentForm({ ...documentForm, invoiceId: value === '' ? undefined : parseInt(value, 10) });
              }}
              fullWidth
            >
              {invoices.map((invoice) => (
                <MenuItem key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber}
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
          <Button onClick={() => setDocumentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDocument} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Document Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this document? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteDocument} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default PropertyDetailPage;
