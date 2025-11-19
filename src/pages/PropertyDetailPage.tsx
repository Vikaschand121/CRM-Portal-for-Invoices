import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ArrowBack,
  Business,
  CalendarToday,
  CloudUpload,
  Delete,
  Description,
  Edit,
  HomeWork,
  LocationOn,
  MonetizationOn,
  People,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import { Property, Tenant, Document, Invoice, CreateTenantPayload, CreateDocumentPayload } from '../types';
import { propertiesService } from '../services/properties.service';
import { tenantsService } from '../services/tenants.service';
import { documentsService } from '../services/documents.service';
import { invoicesService } from '../services/invoices.service';
import { useSnackbar } from '../hooks/useSnackbar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';


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
  const { showSnackbar } = useSnackbar();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm, setTenantForm] = useState<CreateTenantPayload>({
    tenantName: '',
    propertyId: parseInt(propertyId || '0'),
    leaseStartDate: '',
    leaseEndDate: '',
    rentReviewDates: '',
    breakDate: '',
    lenderName: '',
    isVatAvailable: false,
  });
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState<CreateDocumentPayload>({
    name: '',
    type: '',
    file: null as any,
    propertyId: parseInt(propertyId || '0'),
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
        setDocuments([
          {
            id: 1,
            name: 'Lease Agreement',
            type: 'PDF',
            url: '#',
            propertyId: parseInt(propertyId),
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            name: 'Lease Agreement Addendum 1',
            type: 'PDF',
            url: '#',
            propertyId: parseInt(propertyId),
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-01-15T00:00:00.000Z',
          },
          {
            id: 3,
            name: 'Lease Agreement Addendum 2',
            type: 'PDF',
            url: '#',
            propertyId: parseInt(propertyId),
            createdAt: '2024-02-01T00:00:00.000Z',
            updatedAt: '2024-02-01T00:00:00.000Z',
          },
          {
            id: 4,
            name: 'Property Insurance',
            type: 'PDF',
            url: '#',
            propertyId: parseInt(propertyId),
            createdAt: '2024-02-15T00:00:00.000Z',
            updatedAt: '2024-02-15T00:00:00.000Z',
          },
        ]);
        setInvoices([
          {
            id: 1,
            amount: 1200,
            date: '2024-01-01',
            status: 'Paid',
            propertyId: parseInt(propertyId),
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            amount: 1200,
            date: '2024-02-01',
            status: 'Pending',
            propertyId: parseInt(propertyId),
            createdAt: '2024-02-01T00:00:00.000Z',
            updatedAt: '2024-02-01T00:00:00.000Z',
          },
        ]);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
      breakDate: '',
      lenderName: '',
      isVatAvailable: false,
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
      breakDate: tenant.breakDate,
      lenderName: tenant.lenderName,
      isVatAvailable: tenant.isVatAvailable,
    });
    setTenantDialogOpen(true);
  };

  const handleDeleteTenant = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await tenantsService.deleteTenant(id);
        showSnackbar('Tenant deleted successfully', 'success');
        loadData();
      } catch (err) {
        showSnackbar('Failed to delete tenant', 'error');
      }
    }
  };

  const handleSaveTenant = async () => {
    try {
      if (editingTenant) {
        await tenantsService.updateTenant(editingTenant.id, tenantForm);
        showSnackbar('Tenant updated successfully', 'success');
      } else {
        await tenantsService.createTenant(tenantForm);
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
      name: '',
      type: '',
      file: null as any,
      propertyId: parseInt(propertyId || '0'),
    });
    setDocumentDialogOpen(true);
  };

  const handleDeleteDocument = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentsService.deleteDocument(id);
        showSnackbar('Document deleted successfully', 'success');
        loadData();
      } catch (err) {
        showSnackbar('Failed to delete document', 'error');
      }
    }
  };

  const handleSaveDocument = async () => {
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
      label: 'Outstanding Invoices',
      value: 1,
      // helper: 'Uploaded Documents',
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
            <Button variant="contained" startIcon={<Add />} onClick={handleAddTenant}>
              Add Tenant
            </Button>
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
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lender Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>VAT Available</TableCell>
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
                    <TableCell>{new Date(tenant.breakDate).toLocaleDateString()}</TableCell>
                    <TableCell>{tenant.lenderName}</TableCell>
                    <TableCell>{tenant.isVatAvailable ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditTenant(tenant)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteTenant(tenant.id)}>
                        <Delete />
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
            <Button variant="contained" startIcon={<CloudUpload />} onClick={handleAddDocument}>
              Upload Document
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'secondary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Uploaded</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}/documents/${doc.id}`)}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteDocument(doc.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabValue === 3 && (
        <Box sx={{ mt: 2 }}>
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
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewInvoice(invoice.id)}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEditInvoice(invoice.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteInvoice(invoice.id)}>
                        <Delete />
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
            />
            <TextField
              label="Lease Start Date"
              type="date"
              value={tenantForm.leaseStartDate}
              onChange={(e) => setTenantForm({ ...tenantForm, leaseStartDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Lease End Date"
              type="date"
              value={tenantForm.leaseEndDate}
              onChange={(e) => setTenantForm({ ...tenantForm, leaseEndDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Rent Review Dates"
              value={tenantForm.rentReviewDates}
              onChange={(e) => setTenantForm({ ...tenantForm, rentReviewDates: e.target.value })}
              fullWidth
            />
            <TextField
              label="Break Date"
              type="date"
              value={tenantForm.breakDate}
              onChange={(e) => setTenantForm({ ...tenantForm, breakDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Lender Name"
              value={tenantForm.lenderName}
              onChange={(e) => setTenantForm({ ...tenantForm, lenderName: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={tenantForm.isVatAvailable}
                  onChange={(e) => setTenantForm({ ...tenantForm, isVatAvailable: e.target.checked })}
                  color="primary"
                />
              }
              label="Is VAT Applicable"
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
              value={documentForm.name}
              onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Document Type"
              value={documentForm.type}
              onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
              fullWidth
            />
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

    </Container>
  );
};

export default PropertyDetailPage;