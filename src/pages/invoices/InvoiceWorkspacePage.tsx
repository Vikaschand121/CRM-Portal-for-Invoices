import { useEffect, useMemo, useState } from 'react';
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
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Edit, Print, Save, Send } from '@mui/icons-material';
import { Property, Tenant, Invoice } from '../../types';
import { propertiesService } from '../../services/properties.service';
import { tenantsService } from '../../services/tenants.service';
import { invoicesService } from '../../services/invoices.service';
import { useSnackbar } from '../../hooks/useSnackbar';

type WorkspaceMode = 'create' | 'edit';

type InvoiceType = 'rental' | 'service_charge' | 'maintenance' | 'insurance' | 'other' | 'rents_deposit';
type BillingFrequency = 'monthly' | 'quarterly';

interface InvoiceFormState {
  invoiceNumber: string;
  invoiceType: InvoiceType;
  billingFrequency: BillingFrequency;
  invoiceDate: string;
  rentalPeriodStart: string;
  rentalPeriodEnd: string;
  tenantId: number | null;
  companyId: number | null;
  propertyId: number;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  status: string;
  notes: string;
}

const VAT_RATE = 0.2;

const INVOICE_TYPES: { value: InvoiceType; label: string }[] = [
  { value: 'rental', label: 'Rental Invoice' },
  { value: 'service_charge', label: 'Service Charge Invoice' },
  { value: 'maintenance', label: 'Maintenance Invoice' },
  { value: 'insurance', label: 'Insurance Invoice' },
   { value: 'rents_deposit', label: 'Rent Deposit Invoice' },
  { value: 'other', label: 'Miscellaneous Invoice' },
];

const BILLING_OPTIONS: { value: BillingFrequency; label: string; months: number }[] = [
  { value: 'monthly', label: 'Monthly (1 Month)', months: 1 },
  { value: 'quarterly', label: 'Quarterly (3 Months)', months: 3 },
];

const BANK_DETAILS = {
  accountName: 'Prime Investments Holdings',
  bankName: 'Barclays Bank PLC',
  sortCode: '20-45-78',
  accountNumber: '60986543',
  iban: 'GB29 BARC 2045 7860 9865 43',
  swift: 'BARCGB22',
};

const iso = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const periodEnd = (start: string, freq: BillingFrequency) => {
  if (!start) return '';
  const base = new Date(start);
  if (Number.isNaN(base.getTime())) return '';
  const months = BILLING_OPTIONS.find((option) => option.value === freq)?.months ?? 1;
  const end = new Date(base);
  end.setMonth(end.getMonth() + months);
  end.setDate(end.getDate() - 1);
  return iso(end);
};

const formatDate = (value?: string) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const buildInitialForm = (propertyId: number, companyId: number | null, tenantId: number | null): InvoiceFormState => {
  const today = iso(new Date());
  return {
    invoiceNumber: `INV-${propertyId}-${Date.now().toString().slice(-4)}`,
    invoiceType: 'rental',
    billingFrequency: 'monthly',
    invoiceDate: today,
    rentalPeriodStart: today,
    rentalPeriodEnd: periodEnd(today, 'monthly'),
    tenantId,
    companyId,
    propertyId,
    netAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
    status: 'Draft',
    notes: '',
  };
};

interface InvoiceWorkspacePageProps {
  mode: WorkspaceMode;
}

export const InvoiceWorkspacePage = ({ mode }: InvoiceWorkspacePageProps) => {
  const { companyId, propertyId, invoiceId } = useParams<{ companyId: string; propertyId: string; invoiceId?: string }>();
  const numericCompanyId = Number(companyId);
  const numericPropertyId = Number(propertyId);
  const numericInvoiceId = invoiceId ? Number(invoiceId) : undefined;

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState<InvoiceFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === form?.tenantId ?? -1),
    [tenants, form?.tenantId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      if (!numericCompanyId || !numericPropertyId) {
        setError('Missing company/property context');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [properties, tenantList] = await Promise.all([
          propertiesService.getProperties(),
          tenantsService.getTenants(numericPropertyId),
        ]);
        if (cancelled) return;

        const foundProperty = properties.find((p) => p.id === numericPropertyId);
        if (!foundProperty) {
          throw new Error('Property not found');
        }
        setProperty(foundProperty);
        setTenants(tenantList);

        if (mode === 'edit' && numericInvoiceId) {
          const existingInvoices = await invoicesService.getInvoices(numericPropertyId);
          const target = existingInvoices.find((inv) => inv.id === numericInvoiceId);
          if (!target) throw new Error('Invoice not found');
          setForm({
            invoiceNumber: target.invoiceNumber || target.id.toString(),
            invoiceType: (target as any).invoiceType ?? 'rental',
            billingFrequency: (target as any).billingFrequency ?? 'monthly',
            invoiceDate: target.date ?? target.createdAt,
            rentalPeriodStart: (target as any).rentalPeriodStart ?? target.date,
            rentalPeriodEnd: (target as any).rentalPeriodEnd ?? target.date,
            tenantId: (target as any).tenantId ?? tenantList[0]?.id ?? null,
            companyId: foundProperty.company?.id ?? numericCompanyId,
            propertyId: numericPropertyId,
            netAmount: (target as any).netAmount ?? target.amount,
            vatAmount: (target as any).vatAmount ?? target.amount * VAT_RATE,
            totalAmount: (target as any).totalAmount ?? target.amount * (1 + VAT_RATE),
            status: target.status,
            notes: (target as any).notes ?? '',
          });
          // Auto-generate notes for existing invoices if they don't have notes
          if (!(target as any).notes) {
            setTimeout(() => {
              const notes = generateNotes();
              updateForm({ notes });
            }, 500);
          }
        } else {
          setForm(buildInitialForm(numericPropertyId, foundProperty.company?.id ?? numericCompanyId, tenantList[0]?.id ?? null));
          // Auto-generate notes for new invoices after a short delay to ensure data is loaded
          setTimeout(() => {
            if (form) {
              const notes = generateNotes();
              updateForm({ notes });
            }
          }, 500);
        }
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
  }, [mode, numericCompanyId, numericPropertyId, numericInvoiceId]);

  const updateForm = (patch: Partial<InvoiceFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleFrequencyChange = (value: BillingFrequency) => {
    if (!form) return;
    const newEnd = periodEnd(form.rentalPeriodStart, value);
    updateForm({ billingFrequency: value, rentalPeriodEnd: newEnd });
    // Auto-generate notes when billing frequency changes
    setTimeout(() => handleRentalPeriodChange(), 100);
  };

  const handleRentalStartChange = (value: string) => {
    if (!form) return;
    const newEnd = periodEnd(value, form.billingFrequency);
    updateForm({ rentalPeriodStart: value, rentalPeriodEnd: newEnd });
    // Auto-generate notes when rental period changes
    setTimeout(() => handleRentalPeriodChange(), 100);
  };

  const handleNetAmountChange = (value: string) => {
    if (!form) return;
    const net = Number(value) || 0;
    const vat = net * VAT_RATE;
    updateForm({ netAmount: net, vatAmount: vat, totalAmount: net + vat });
    // Auto-generate notes when amount changes
    setTimeout(() => handleRentalPeriodChange(), 100);
  };

  const generateNotes = () => {
    if (!form || !property) return '';

    const startDate = new Date(form.rentalPeriodStart);
    const endDate = new Date(form.rentalPeriodEnd);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const rentPerDay = form.netAmount / 365; // Assuming annual rent
    const totalRentDue = rentPerDay * daysDiff;

    const companyName = property.company?.name || 'Company';
    const tenantName = currentTenant?.tenantName || 'Tenant';
    const leaseStartDate = currentTenant ? new Date(currentTenant.leaseStartDate).toLocaleDateString('en-GB') : 'N/A';

    return `${daysDiff} days between ${startDate.toLocaleDateString('en-GB')} to ${endDate.toLocaleDateString('en-GB')}. Rent per day is £${form.netAmount.toFixed(2)}/365 = £${rentPerDay.toFixed(2)}. Rent due for ${daysDiff} days is £${rentPerDay.toFixed(2)} * ${daysDiff} = £${totalRentDue.toFixed(2)}.

Lease agreed between ${companyName} and ${tenantName} on ${leaseStartDate} with The Enterprise.

PLEASE NOTE: NO REMINDERS WILL BE SENT. IF PAYMENT IS NOT RECEIVED BY THE STATED DUE DATE, OR WITHIN 7 DAYS WHERE A DUE DATE IS NOT STATED, OR PRIOR AGREEMENT REACHED, OUR SOLICITORS WILL BE INSTRUCTED TO COLLECT THE AMOUNT OUTSTANDING IN ACCORDANCE WITH THE TERMS OF THE LEASE.`;
  };

  const handleRentalPeriodChange = () => {
    if (!form || !property) return;
    const notes = generateNotes();
    updateForm({ notes });
  };

  const handleSave = async (nextStatus: string) => {
    if (!form || saving) return;
    try {
      setSaving(true);

      const payload = {
        amount: form.totalAmount,
        date: form.invoiceDate,
        status: nextStatus,
        propertyId: form.propertyId,
        meta: {
          invoiceNumber: form.invoiceNumber,
          invoiceType: form.invoiceType,
          billingFrequency: form.billingFrequency,
          rentalPeriodStart: form.rentalPeriodStart,
          rentalPeriodEnd: form.rentalPeriodEnd,
          tenantId: form.tenantId,
          companyId: form.companyId,
          netAmount: form.netAmount,
          vatAmount: form.vatAmount,
          totalAmount: form.totalAmount,
          notes: form.notes,
          bankDetails: BANK_DETAILS,
        },
      } as any; // TODO: extend backend/CreateInvoicePayload to avoid casting.

      if (mode === 'edit' && numericInvoiceId) {
        await invoicesService.updateInvoice(numericInvoiceId, payload);
        showSnackbar('Invoice updated successfully', 'success');
      } else {
        await invoicesService.createInvoice(payload);
        showSnackbar('Invoice created successfully', 'success');
      }
      navigate(`/companies/${companyId}/properties/${propertyId}`);
    } catch (err) {
      showSnackbar('Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading || !form || !property) {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}`)}>
          Back to Property
        </Button>
        <Stack direction="row" spacing={1}>
          <Chip label={form.status} color={form.status === 'Paid' ? 'success' : form.status === 'Overdue' ? 'error' : 'info'} />
          <Button variant="outlined" startIcon={<Save />} disabled={saving} onClick={() => handleSave('Draft')}>
            Save Draft
          </Button>
          <Button variant="contained" startIcon={<Send />} disabled={saving} onClick={() => handleSave('Issued')}>
            Issue Invoice
          </Button>
          {mode === 'edit' && (
            <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate('')}>
              Edit Details
            </Button>
          )}
          <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
            Print / PDF
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={4} sx={{ p: 4, bgcolor: 'background.paper', width: '100%', minHeight: '1120px' /* A4 feel */ }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {INVOICE_TYPES.find((type) => type.value === form.invoiceType)?.label ?? 'Invoice'}
            </Typography>
            <Typography color="text.secondary">Invoice #{form.invoiceNumber}</Typography>
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
          <Grid item xs={12} md={4}>
            <TextField select label="Invoice Type" value={form.invoiceType} fullWidth onChange={(e) => updateForm({ invoiceType: e.target.value as InvoiceType })}>
              {INVOICE_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Invoice Number" value={form.invoiceNumber} onChange={(e) => updateForm({ invoiceNumber: e.target.value })} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Invoice Date" type="date" value={form.invoiceDate} onChange={(e) => updateForm({ invoiceDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField select label="Billed To (Tenant)" value={form.tenantId ?? ''} fullWidth onChange={(e) => updateForm({ tenantId: Number(e.target.value) })}>
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.tenantName}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Lease: {currentTenant ? `${formatDate(currentTenant.leaseStartDate)} - ${formatDate(currentTenant.leaseEndDate)}` : 'Select a tenant'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField label="Property Address" value={property.propertyAddress} fullWidth disabled />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Company: {property.company?.name}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField select label="Billing Frequency" value={form.billingFrequency} onChange={(e) => handleFrequencyChange(e.target.value as BillingFrequency)} fullWidth>
              {BILLING_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Rental Period Start" type="date" value={form.rentalPeriodStart} onChange={(e) => handleRentalStartChange(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Rental Period End" type="date" value={form.rentalPeriodEnd} fullWidth InputLabelProps={{ shrink: true }} disabled />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField label="Net Amount" type="number" value={form.netAmount} onChange={(e) => handleNetAmountChange(e.target.value)} fullWidth InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>£</Typography> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="VAT (20%)" value={form.vatAmount.toFixed(2)} fullWidth InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>£</Typography> }} disabled />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Total Amount" value={form.totalAmount.toFixed(2)} fullWidth InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>£</Typography> }} disabled />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Invoice Terms & Conditions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  {form.notes.split('\n\n')[0] || 'Period calculation will appear here'}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  {form.notes.split('\n\n')[1] || 'Lease agreement details will appear here'}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  {form.notes.split('\n\n')[2] || 'Payment terms will appear here'}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Bank Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BankLine label="Account Name" value={BANK_DETAILS.accountName} />
            <BankLine label="Bank" value={BANK_DETAILS.bankName} />
            <BankLine label="Sort Code" value={BANK_DETAILS.sortCode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <BankLine label="Account Number" value={BANK_DETAILS.accountNumber} />
            <BankLine label="IBAN" value={BANK_DETAILS.iban} />
            <BankLine label="SWIFT" value={BANK_DETAILS.swift} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

const BankLine = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);