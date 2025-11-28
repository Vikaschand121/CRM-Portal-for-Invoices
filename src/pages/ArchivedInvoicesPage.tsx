import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
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
import {
  Business,
  Visibility,
  ArrowBack,
  Unarchive,
} from '@mui/icons-material';
import { Invoice } from '../types';
import { invoicesService } from '../services/invoices.service';
import { showSuccess, showError } from '../utils/snackbar';

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

export const ArchivedInvoicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fromProperty = location.state?.fromProperty;
  const fromCompany = location.state?.fromCompany;

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesService.getArchivedInvoices();
      setInvoices(data);
    } catch (error) {
      showError('Failed to load archived invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (invoiceId: number) => {
    if (window.confirm('Are you sure you want to restore this invoice?')) {
      try {
        await invoicesService.restoreInvoice(invoiceId);
        showSuccess('Invoice restored successfully');
        loadInvoices();
      } catch (error) {
        showError('Failed to restore invoice');
      }
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading archived invoices...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/property-management')}>
            Back to Property Management
          </Button>
          {fromProperty && fromCompany && (
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => {
                if (fromCompany && fromProperty) {
                  navigate(`/companies/${fromCompany}/properties/${fromProperty}`, { state: { tab: 'invoices' } });
                } else {
                  navigate('/companies');
                }
              }}
            >
              Back to Invoices
            </Button>
          )}
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 2
        }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Archived Invoices
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all archived invoices across all properties
            </Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'success.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Number</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Property</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tenant</TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Due Date</TableCell>
                </>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 5 : 7} align="center">
                  No archived invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.property?.propertyName || 'N/A'}</TableCell>
                  <TableCell>{invoice.tenant?.tenantName || 'N/A'}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    </>
                  )}
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => navigate(`/companies/${invoice.property?.company?.id}/properties/${invoice.propertyId}/invoices/${invoice.id}`)}>
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleRestore(invoice.id)}>
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