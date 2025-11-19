import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack, DeleteForever } from '@mui/icons-material';
import { Invoice } from '../../types';
import { invoicesService } from '../../services/invoices.service';

export const InvoiceDeletePage = () => {
  const { companyId, propertyId, invoiceId } = useParams<{ companyId: string; propertyId: string; invoiceId: string }>();
  const numericInvoiceId = Number(invoiceId);

  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadInvoice = async () => {
      if (!numericInvoiceId) {
        setError('Invalid invoice ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const invoiceData = await invoicesService.getInvoice(numericInvoiceId);
        if (cancelled) return;
        setInvoice(invoiceData);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to load invoice');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInvoice();
    return () => {
      cancelled = true;
    };
  }, [numericInvoiceId]);

  const handleDelete = async () => {
    if (!invoice) return;
    try {
      setDeleting(true);
      await invoicesService.deleteInvoice(invoice.id);
      navigate(`/companies/${companyId}/properties/${propertyId}`, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete invoice');
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/companies/${companyId}/properties/${propertyId}/invoices/${invoiceId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !invoice) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Invoice not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
        <DeleteForever sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="error">
          Delete Invoice
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Are you sure you want to permanently delete this invoice? This action cannot be undone.
        </Typography>

        <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Invoice Details
          </Typography>
          <Typography variant="body2">
            <strong>Invoice ID:</strong> {invoice.id}
          </Typography>
          <Typography variant="body2">
            <strong>Amount:</strong> £{invoice.amount.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> {invoice.status}
          </Typography>
          <Typography variant="body2">
            <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={handleCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteForever />}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Invoice'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};