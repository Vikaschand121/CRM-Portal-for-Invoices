import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack, Unarchive, Visibility } from '@mui/icons-material';
import { Payment } from '../types';
import { propertiesService } from '../services/properties.service';
import { showError, showSuccess } from '../utils/snackbar';

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

export const ArchivedPaymentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fromTenant = location.state?.fromTenant;
  const searchTenantId = new URLSearchParams(location.search).get('tenantId');
  const resolvedTenantId = fromTenant ?? (searchTenantId ? parseInt(searchTenantId, 10) : undefined);

  const loadPayments = async () => {
    try {
      setLoading(true);
      if (!resolvedTenantId) {
        showError('Tenant context missing for archived payments');
        setLoading(false);
        return;
      }
      const data = await propertiesService.getArchivedPayments(resolvedTenantId);
      setPayments(data);
    } catch (error) {
      showError('Failed to load archived payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (paymentId: number) => {
    if (window.confirm('Are you sure you want to restore this payment?')) {
      try {
        await propertiesService.restorePayment(paymentId);
        showSuccess('Payment restored successfully');
        loadPayments();
      } catch (error) {
        showError('Failed to restore payment');
      }
    }
  };

  useEffect(() => {
    loadPayments();
  }, [resolvedTenantId]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading archived payments...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/property-management')}>
            Back to Property Management
          </Button>
          {resolvedTenantId && (
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => navigate(`/tenants/${resolvedTenantId}`)}
            >
              Back to Tenant
            </Button>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Archived Payments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and restore archived payments across all tenants
            </Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'success.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Number</TableCell>
              {!isMobile && (
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Payment Date</TableCell>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount Received</TableCell>
              {!isMobile && (
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Payment Method</TableCell>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : 5} align="center">
                  No archived payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.invoiceNumber}</TableCell>
                  {!isMobile && (
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  )}
                  <TableCell>{formatCurrency(parseFloat(payment.amountReceived))}</TableCell>
                  {!isMobile && <TableCell>{payment.paymentMethod}</TableCell>}
                  <TableCell>
                    <IconButton onClick={() => navigate(`/payments/${payment.id}`)}>
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleRestore(payment.id)}>
                      <Unarchive />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ArchivedPaymentsPage;
