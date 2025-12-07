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
} from '@mui/icons-material';
import { Tenant, Invoice, CreateDocumentPayload } from '../types';
import { tenantsService } from '../services/tenants.service';
import { invoicesService } from '../services/invoices.service';
import { documentsService } from '../services/documents.service';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [documentForm, setDocumentForm] = useState<CreateDocumentPayload>({
    documentName: '',
    documentType: INVOICE_DOCUMENT_TYPES[0],
    documentSubType: '',
    file: null,
    invoiceId: 0,
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
        const invoiceData = await invoicesService.getInvoicesByTenant(parseInt(tenantId));
        setInvoices(invoiceData);
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
    setDocumentDialogOpen(true);
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
    if (!documentForm.file) {
      showSnackbar('Please select a file to upload', 'error');
      return;
    }

    try {
      await documentsService.createDocument(documentForm);
      showSnackbar('Document uploaded successfully', 'success');
      setDocumentDialogOpen(false);
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
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
                  onClick={() => navigate(`/companies/${tenant?.property?.company?.id}/properties/${tenant?.property?.id}`, { state: { tab: 'tenants' } })}
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
                  Back
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
                      <IconButton onClick={() => handleViewInvoice(invoice.id)} sx={{ color: 'primary.main' }}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleEditInvoice(invoice.id)} sx={{ color: 'secondary.main' }}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleUploadInvoiceDocument(invoice.id)} sx={{ color: 'info.main' }}>
                        <CloudUpload />
                      </IconButton>
                      <IconButton onClick={() => handleArchiveInvoice(invoice.id)} sx={{ color: 'warning.main' }}>
                        <Archive />
                      </IconButton>
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
              />
              <TextField
                select
                label="Document Type"
                value={documentForm.documentType}
                onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                fullWidth
                required
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
            <Button onClick={() => setDocumentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDocument} variant="contained">
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TenantDetailPage;