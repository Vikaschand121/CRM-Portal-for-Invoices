import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack, Edit, Print, Delete } from '@mui/icons-material';
import { Invoice } from '../../types';
import { invoicesService } from '../../services/invoices.service';
import { propertiesService } from '../../services/properties.service';
import { tenantsService } from '../../services/tenants.service';

const formatDate = (value?: string) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const BankLine = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

export const InvoiceViewPage = () => {
  const { companyId, propertyId, invoiceId } = useParams<{ companyId: string; propertyId: string; invoiceId: string }>();
  const numericPropertyId = Number(propertyId);
  const numericInvoiceId = Number(invoiceId);

  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [property, setProperty] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      if (!numericPropertyId || !numericInvoiceId) {
        setError('Missing property/invoice context');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [invoiceData, properties, tenants] = await Promise.all([
          invoicesService.getInvoice(numericInvoiceId),
          propertiesService.getProperties(),
          tenantsService.getTenants(numericPropertyId),
        ]);
        if (cancelled) return;

        const foundProperty = properties.find((p) => p.id === numericPropertyId);
        if (!foundProperty) {
          throw new Error('Property not found');
        }
        setProperty(foundProperty);

        const foundTenant = tenants.find((t) => t.id === (invoiceData as any).meta?.tenantId);
        setTenant(foundTenant || null);

        setInvoice(invoiceData);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to load invoice data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPage();
    return () => {
      cancelled = true;
    };
  }, [numericPropertyId, numericInvoiceId]);

  const handlePrint = () => window.print();

  const handleDelete = async () => {
    if (!invoice) return;
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoicesService.deleteInvoice(invoice.id);
        navigate(`/companies/${companyId}/properties/${propertyId}`);
      } catch (err) {
        setError('Failed to delete invoice');
      }
    }
  };

  if (loading || !invoice || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </>
        ) : (
          <CircularProgress />
        )}
      </Container>
    );
  }

  const meta = (invoice as any).meta || {};
  const bankDetails = meta.bankDetails || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}`)}>
          Back to Property
        </Button>
        <Stack direction="row" spacing={1}>
          <Chip label={invoice.status} color={invoice.status === 'Paid' ? 'success' : invoice.status === 'Overdue' ? 'error' : 'info'} />
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}/invoices/${invoiceId}/edit`)}>
            Edit Invoice
          </Button>
          <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
            Print / PDF
          </Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
            Delete Invoice
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={4} sx={{ p: 4, bgcolor: 'background.paper', width: '100%', minHeight: '1120px' /* A4 feel */ }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {meta.invoiceType ? `${meta.invoiceType.charAt(0).toUpperCase() + meta.invoiceType.slice(1)} Invoice` : 'Invoice'}
            </Typography>
            <Typography color="text.secondary">Invoice #{meta.invoiceNumber || invoice.id}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="h6">{property.company?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {property.company?.registeredAddress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Company No: {property.company?.companyNumber}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Invoice Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Invoice Type</Typography>
              <Typography>{meta.invoiceType || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Invoice Date</Typography>
              <Typography>{formatDate(invoice.date)}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Billing Frequency</Typography>
              <Typography>{meta.billingFrequency || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Rental Period</Typography>
              <Typography>{formatDate(meta.rentalPeriodStart)} - {formatDate(meta.rentalPeriodEnd)}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Billed To
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Tenant</Typography>
              <Typography>{tenant?.tenantName || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Property Address</Typography>
              <Typography>{property.propertyAddress}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Lease Period</Typography>
              <Typography>{tenant ? `${formatDate(tenant.leaseStartDate)} - ${formatDate(tenant.leaseEndDate)}` : 'N/A'}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Amount Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Net Amount</Typography>
                  <Typography variant="h6">£{meta.netAmount?.toFixed(2) || invoice.amount.toFixed(2)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">VAT (20%)</Typography>
                  <Typography variant="h6">£{meta.vatAmount?.toFixed(2) || (invoice.amount * 0.2).toFixed(2)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="h6" fontWeight={700}>£{meta.totalAmount?.toFixed(2) || invoice.amount.toFixed(2)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {meta.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography>{meta.notes}</Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Bank Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BankLine label="Account Name" value={bankDetails.accountName || 'N/A'} />
            <BankLine label="Bank" value={bankDetails.bankName || 'N/A'} />
            <BankLine label="Sort Code" value={bankDetails.sortCode || 'N/A'} />
          </Grid>
          <Grid item xs={12} md={6}>
            <BankLine label="Account Number" value={bankDetails.accountNumber || 'N/A'} />
            <BankLine label="IBAN" value={bankDetails.iban || 'N/A'} />
            <BankLine label="SWIFT" value={bankDetails.swift || 'N/A'} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};