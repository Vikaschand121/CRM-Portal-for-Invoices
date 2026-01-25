import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Switch, Typography } from '@mui/material';
import { ArrowBack, Edit, Print, Delete, Description } from '@mui/icons-material';
import { Invoice } from '../../types';
import { invoicesService } from '../../services/invoices.service';
import { propertiesService } from '../../services/properties.service';
import { tenantsService } from '../../services/tenants.service';
import { InvoicePreview } from '../../components/InvoicePreview';
import { useSnackbar } from '../../hooks/useSnackbar';

const formatDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

export const InvoiceViewPage = () => {
  const { companyId, propertyId, invoiceId } = useParams<{ companyId: string; propertyId: string; invoiceId: string }>();
  const numericPropertyId = Number(propertyId);
  const numericInvoiceId = Number(invoiceId);

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [property, setProperty] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [displayedRecurring, setDisplayedRecurring] = useState(false);
  const [pendingRecurring, setPendingRecurring] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [savingRecurring, setSavingRecurring] = useState(false);

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

        const foundTenant = tenants.find((t) => t.id === invoiceData.tenantId);
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

  useEffect(() => {
    if (tenant && typeof tenant.isRecurring === 'boolean') {
      setIsRecurring(tenant.isRecurring);
      setDisplayedRecurring(tenant.isRecurring);
    }
  }, [tenant]);

  const handleRecurringToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;
    setPendingRecurring(nextValue);
    setDisplayedRecurring(nextValue);
    setRecurringDialogOpen(true);
  };

  const handleConfirmRecurring = async () => {
    if (!tenant) {
      setRecurringDialogOpen(false);
      return;
    }
    setSavingRecurring(true);
    try {
      await tenantsService.setInvoiceRecurring(tenant.id, pendingRecurring);
      setIsRecurring(pendingRecurring);
      setDisplayedRecurring(pendingRecurring);
      setTenant((prev: any) => (prev ? { ...prev, isRecurring: pendingRecurring } : prev));
      showSnackbar('Recurring preference updated', 'success');
    } catch (error) {
      showSnackbar('Failed to update recurring preference', 'error');
      setDisplayedRecurring(isRecurring);
      setPendingRecurring(isRecurring);
    } finally {
      setSavingRecurring(false);
      setRecurringDialogOpen(false);
    }
  };

  const handleCancelRecurring = () => {
    setDisplayedRecurring(isRecurring);
    setPendingRecurring(isRecurring);
    setRecurringDialogOpen(false);
  };

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

  const previousBalanceValue = tenant?.previousBalance ?? 0;
  const creditNoteValue = Number.isFinite(Number(invoice.creditNoteAmount ?? 0)) ? Number(invoice.creditNoteAmount ?? 0) : 0;
  const baseBalance =
    invoice.balanceDue && invoice.balanceDue !== ''
      ? Number(invoice.balanceDue)
      : previousBalanceValue + invoice.totalAmount - invoice.paymentMade;
  const safeBalanceDue =
    Number.isFinite(baseBalance)
      ? baseBalance - creditNoteValue
      : invoice.totalAmount - creditNoteValue;
  const isRentalInvoice = invoice.invoiceName === 'Rental Invoice' || invoice.invoiceType === 'Rent';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            const tenantRoute = invoice?.tenantId ? `/tenants/${invoice.tenantId}` : `/companies/${companyId}/properties/${propertyId}`;
            navigate(tenantRoute);
          }}
        >
          Back to Invoice
        </Button>
        {isRentalInvoice && tenant ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Non-Recurring
            </Typography>
            <Switch
              checked={displayedRecurring}
              onChange={handleRecurringToggle}
              disabled={savingRecurring}
              color="secondary"
              inputProps={{ 'aria-label': 'Toggle recurring invoices' }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Recurring
            </Typography>
          </Box>
        ) : null}
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}/invoices/${invoiceId}/edit`)}>
            Edit Invoice
          </Button>
          <Button variant="outlined" startIcon={<Description />} onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}/invoices/${invoiceId}/documents`)}>
            Documents
          </Button>
          <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
            Print / PDF
          </Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
            Delete Invoice
          </Button>
        </Stack>
      </Stack>

      <InvoicePreview
        invoiceTitle={invoice.invoiceName || `${invoice.invoiceType} Invoice`}
        invoiceNumber={invoice.invoiceNumber}
        invoiceDate={formatDate(invoice.invoiceDate)}
        dueDate={formatDate(invoice.dueDate)}
        terms={invoice.terms || 'Due on Receipt'}
        billToName={invoice.billToName || invoice.tenantName || 'Tenant'}
        billToAddress={invoice.billToAddress || tenant?.tenantCorrespondingAddress || ''}
        propertyAddress={property.propertyAddress}
        propertyName={property.propertyName}
        crmRentStartDate={invoice.crmRentStartDate}
        crmRentEndDate={invoice.crmRentEndDate}
        netAmount={invoice.netAmount}
        vatAmount={invoice.vatAmount}
        vatRate={invoice.vatRate}
        totalAmount={invoice.totalAmount}
        paymentMade={invoice.paymentMade}
        previousBalance={previousBalanceValue}
        balanceDue={safeBalanceDue}
        notes={invoice.notes}
        company={property.company}
        tenant={tenant}
        creditNoteAmount={creditNoteValue}
        bankDetails={{
          accountHolderName: invoice.bankAccountName,
          bankName: invoice.bankName,
          sortCode: invoice.bankSortCode,
          accountNumber: invoice.bankAccountNumber,
          bankAddress: invoice.bankAddress,
        }}
      />

      <Dialog open={recurringDialogOpen} onClose={handleCancelRecurring} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Invoice Mode</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark invoices for this tenant as{' '}
            {pendingRecurring ? 'Recurring' : 'Non-Recurring'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRecurring} disabled={savingRecurring}>
            Cancel
          </Button>
          <Button onClick={handleConfirmRecurring} variant="contained" disabled={savingRecurring}>
            {savingRecurring ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

