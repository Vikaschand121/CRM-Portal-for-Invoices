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
import { Property, Tenant, Invoice, BankDetails } from '../../types';
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
  billToName: string;
  billToAddress: string;
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

const INVOICE_TYPE_ABBREVIATIONS: Record<InvoiceType, string> = {
  rental: 'RI',
  service_charge: 'SC',
  maintenance: 'MA',
  insurance: 'IN',
  rents_deposit: 'RD',
  other: 'OT',
};


const iso = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const periodEnd = (start: string, freq: BillingFrequency) => {
  if (!start) return '';
  if (freq === 'quarterly') {
    return currentQuarter.end;
  }
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

const getQuarterDates = (dateStr: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { start: '', end: '' };
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  let start: string, end: string;
  if ((month === 2 && day >= 25) || month === 3 || month === 4 || (month === 5 && day <= 23)) {
    // Q1: Mar 25 - Jun 23
    start = `${year}-03-25`;
    end = `${year}-06-23`;
  } else if ((month === 5 && day >= 24) || month === 6 || month === 7 || (month === 8 && day <= 28)) {
    // Q2: Jun 24 - Sep 28
    start = `${year}-06-24`;
    end = `${year}-09-28`;
  } else if ((month === 8 && day >= 29) || month === 9 || month === 10 || (month === 11 && day <= 24)) {
    // Q3: Sep 29 - Dec 24
    start = `${year}-09-29`;
    end = `${year}-12-24`;
  } else {
    // Q4: Dec 25 - Mar 24 next year
    start = `${year}-12-25`;
    end = `${year + 1}-03-24`;
  }
  return { start, end };
};

const currentQuarter = getQuarterDates(iso(new Date()));

const abbreviate = (value: string, length: number, fallback: string) => {
  const cleaned = (value || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  const base = cleaned || fallback;
  return base.substring(0, length).padEnd(length, fallback.substring(0, length));
};

const generateInvoiceNumber = (
  propertyAddress: string,
  tenantName: string,
  invoiceType: InvoiceType,
  existingInvoices: Invoice[]
): string => {
  const propertyAbbrev = abbreviate(propertyAddress, 2, 'PR');
  const tenantAbbrev = abbreviate(tenantName, 3, 'TEN');
  const typeAbbrev = INVOICE_TYPE_ABBREVIATIONS[invoiceType];

  const pattern = new RegExp(`^${propertyAbbrev}/${tenantAbbrev}/${typeAbbrev}/(\\d{3})$`);
  const matchingNumbers: number[] = [];

  existingInvoices.forEach((invoice) => {
    const invoiceNumber = (invoice as any).invoiceNumber || invoice.id.toString();
    const match = invoiceNumber.match(pattern);
    if (match) {
      matchingNumbers.push(parseInt(match[1], 10));
    }
  });

  const nextNumber = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) + 1 : 1;
  const formattedNumber = nextNumber.toString().padStart(3, '0');

  return `${propertyAbbrev}/${tenantAbbrev}/${typeAbbrev}/${formattedNumber}`;
};

const buildInitialForm = (propertyId: number, companyId: number | null, tenantId: number | null): InvoiceFormState => {
  const today = iso(new Date());
  return {
    invoiceNumber: `TEMP-${propertyId}-${Date.now().toString().slice(-4)}`, // Temporary, will be updated
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
    billToName: '',
    billToAddress: '',
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
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [existingInvoices, setExistingInvoices] = useState<Invoice[]>([]);
  const [form, setForm] = useState<InvoiceFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === form?.tenantId),
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
        const [properties, tenantList, invoiceList] = await Promise.all([
          propertiesService.getProperties(),
          tenantsService.getTenants(numericPropertyId),
          invoicesService.getInvoices(numericPropertyId),
        ]);

        let bankDetailsData: BankDetails | null = null;
        try {
          bankDetailsData = await propertiesService.getBankDetails(numericCompanyId);
        } catch (err) {
          console.warn('Failed to fetch bank details:', err);
          // Bank details are optional, continue without them
        }
        if (cancelled) return;

        const foundProperty = properties.find((p) => p.id === numericPropertyId);
        if (!foundProperty) {
          throw new Error('Property not found');
        }
        setProperty(foundProperty);
        setTenants(tenantList);
        setBankDetails(bankDetailsData);
        setExistingInvoices(invoiceList);

        if (mode === 'edit' && numericInvoiceId) {
          const existingInvoices = await invoicesService.getInvoices(numericPropertyId);
          const target = existingInvoices.find((inv) => inv.id === numericInvoiceId);
          if (!target) throw new Error('Invoice not found');
          setForm({
            invoiceNumber: target.invoiceNumber,
            invoiceType: target.invoiceType === 'Rent' ? 'rental' : 'other', // Map back
            billingFrequency: 'monthly', // Default, since not in response
            invoiceDate: target.invoiceDate,
            rentalPeriodStart: target.rentalPeriodStart,
            rentalPeriodEnd: target.rentalPeriodEnd,
            tenantId: target.tenantId,
            companyId: foundProperty.company?.id ?? numericCompanyId,
            propertyId: numericPropertyId,
            netAmount: target.netAmount,
            vatAmount: target.vatAmount,
            totalAmount: target.totalAmount,
            status: 'Draft', // Default, since not in response
            notes: target.notes,
            billToName: target.billToName,
            billToAddress: target.billToAddress,
          });
          // Auto-generate notes for existing invoices if they don't have notes
          if (!(target as any).notes) {
            setTimeout(() => {
              const notes = generateNotes();
              updateForm({ notes });
            }, 500);
          }
        } else {
          const initialForm = buildInitialForm(
            numericPropertyId,
            foundProperty.company?.id ?? numericCompanyId,
            null
          );
          const formWithTenant = { ...initialForm, tenantId: null, billToName: '', billToAddress: '', invoiceNumber: `TEMP-${numericPropertyId}-${Date.now().toString().slice(-4)}` };
          setForm(formWithTenant);
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
    const newEnd = value === 'quarterly' ? currentQuarter.end : periodEnd(form.rentalPeriodStart, value);
    updateForm({ billingFrequency: value, rentalPeriodEnd: newEnd });
    // Auto-generate notes when billing frequency changes
    setTimeout(() => handleRentalPeriodChange(), 100);
  };

  const handleRentalStartChange = (value: string) => {
    if (!form) return;
    const newEnd = form.billingFrequency === 'quarterly' ? currentQuarter.end : periodEnd(value, form.billingFrequency);
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
    const annualRent = form.netAmount * 10; // Adjust for correct annual rent amount
    const rentPerDay = annualRent / 365;
    const totalRentDue = rentPerDay * daysDiff;

    const companyName = property.company?.name || 'Company';
    const tenantName = currentTenant?.tenantName || 'Tenant';
    const leaseStartDate = currentTenant ? new Date(currentTenant.leaseStartDate).toLocaleDateString('en-GB') : 'N/A';

    return `The rental period is ${daysDiff} days from ${startDate.toLocaleDateString('en-GB')} to ${endDate.toLocaleDateString('en-GB')}. Annual rent is £${annualRent.toFixed(2)}, giving a daily rate of £${rentPerDay.toFixed(2)}. Rent due for ${daysDiff} days is £${totalRentDue.toFixed(2)}.

Lease agreed between ${companyName} and ${tenantName} on ${leaseStartDate} with The Enterprise.

PLEASE NOTE: NO REMINDERS WILL BE SENT. IF PAYMENT IS NOT RECEIVED BY THE STATED DUE DATE, OR WITHIN 7 DAYS WHERE A DUE DATE IS NOT STATED, OR PRIOR AGREEMENT REACHED, OUR SOLICITORS WILL BE INSTRUCTED TO COLLECT THE AMOUNT OUTSTANDING IN ACCORDANCE WITH THE TERMS OF THE LEASE.`;
  };

  const handleRentalPeriodChange = () => {
    if (!form || !property) return;
    const notes = generateNotes();
    updateForm({ notes });
  };

  const resolveInvoiceType = (invoiceType: InvoiceType): string => {
    switch (invoiceType) {
      case 'rental':
        return 'Rent';
      case 'service_charge':
        return 'Service Charge';
      case 'maintenance':
        return 'Maintenance';
      case 'insurance':
        return 'Insurance';
      case 'rents_deposit':
        return 'Rent Deposit';
      default:
        return 'Other';
    }
  };

  const handleSave = async (nextStatus: string) => {
    console.log('handleSave called with status:', nextStatus);
    if (!form || saving || !property) {
      console.log('handleSave early return: form?', !!form, 'saving?', saving, 'property?', !!property);
      return;
    }

    // Validation
    if (!form.tenantId) {
      showSnackbar('Please select a tenant', 'error');
      return;
    }
    if (!form.billToName.trim()) {
      showSnackbar('Bill to name cannot be empty', 'error');
      return;
    }
    if (!form.billToAddress.trim()) {
      showSnackbar('Bill to address cannot be empty', 'error');
      return;
    }

    try {
      setSaving(true);

      const resolvedInvoiceType = resolveInvoiceType(form.invoiceType);
      const vatRateValue = form.netAmount ? form.vatAmount / form.netAmount : 0;
      const companyContactDetails =
        property.company?.name && property.company?.registeredAddress
          ? `Company: ${property.company.name}\nAddress: ${property.company.registeredAddress}`
          : '';

      const payload = {
        tenantId: form.tenantId,
        propertyId: form.propertyId,
        invoiceName: INVOICE_TYPES.find((type) => type.value === form.invoiceType)?.label ?? 'Invoice',
        invoiceType: resolvedInvoiceType,
        invoiceNumber: form.invoiceNumber,
        invoiceDate: form.invoiceDate,
        terms: 'Due on Receipt',
        dueDate: form.invoiceDate,
        companyName: property.company?.name || '',
        companyAddress: property.company?.registeredAddress || '',
        companyContactDetails,
        billToName: form.billToName,
        billToAddress: form.billToAddress,
        propertyAddress: property.propertyAddress,
        rentalPeriodStart: form.rentalPeriodStart,
        rentalPeriodEnd: form.rentalPeriodEnd,
        netAmount: form.netAmount,
        vatAmount: form.vatAmount,
        vatRate: vatRateValue,
        totalAmount: form.totalAmount,
        paymentMade: 0,
        notes: form.notes,
        bankAccountName: bankDetails?.accountHolderName || '',
        bankName: bankDetails?.bankName || '',
        bankSortCode: bankDetails?.sortCode || '',
        bankAccountNumber: bankDetails?.accountNumber || '',
        bankAddress: bankDetails?.bankAddress || '',
      } as any; // TODO: extend backend/CreateInvoicePayload to avoid casting.

      if (mode === 'edit' && numericInvoiceId) {
        console.log('Updating invoice with ID:', numericInvoiceId);
        console.log('Update payload:', payload);
        await invoicesService.updateInvoice(numericInvoiceId, payload);
        console.log('Invoice updated successfully');
        showSnackbar('Invoice updated successfully', 'success');
        setSubmitted(true);
        setTimeout(() => navigate(`/companies/${companyId}/properties/${propertyId}`), 1000);
      } else {
        console.log('Creating new invoice');
        console.log('Create payload:', payload);
        await invoicesService.createInvoice(payload);
        console.log('Invoice created successfully');
        showSnackbar('Invoice created successfully', 'success');
        setSubmitted(true);
        setTimeout(() => navigate(`/companies/${companyId}/properties/${propertyId}`), 1000);
      }
    } catch (err) {
      console.error('Failed to save invoice:', err);
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
           <Button variant="contained" startIcon={saving || submitted ? <CircularProgress size={20} /> : <Send />} disabled={saving || submitted} onClick={() => handleSave('Issued')}>
             {submitted ? 'Submitted' : saving ? 'Submitting...' : 'Issue Invoice'}
           </Button>
           {mode === 'edit' && (
             <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate('')}>
               Edit Details
             </Button>
           )}
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
            <Typography variant="body2" color="text.secondary">
              VAT No: {property.company?.vatNumber}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Invoice Type"
              value={form.invoiceType}
              fullWidth
              onChange={(e) => {
                const invoiceType = e.target.value as InvoiceType;
                setForm((prev) => {
                  if (!prev) return prev;
                  const tenant = tenants.find((t) => t.id === prev.tenantId);
                  const next = { ...prev, invoiceType };
                  next.invoiceNumber = generateInvoiceNumber(
                    property?.propertyAddress ?? '',
                    tenant?.tenantName ?? '',
                    invoiceType,
                    existingInvoices
                  );
                  return next;
                });
              }}
            >
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
            <TextField
              label="Invoice Date"
              type="date"
              value={form.invoiceDate}
              onChange={(e) => updateForm({ invoiceDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Billed To (Tenant)"
              value={form.tenantId ?? ''}
              fullWidth
              required
              onChange={(e) => {
                const tenantId = Number(e.target.value);
                const tenant = tenants.find((t) => t.id === tenantId);
                setForm((prev) => {
                  if (!prev) return prev;
                  const invoiceNumber = generateInvoiceNumber(
                    property?.propertyAddress ?? '',
                    tenant?.tenantName ?? '',
                    prev.invoiceType,
                    existingInvoices
                  );
                  return {
                    ...prev,
                    tenantId,
                    billToName: tenant ? `${tenant.tenantName} - The Enterprise` : prev.billToName,
                    billToAddress: tenant?.tenantCorrespondingAddress ?? prev.billToAddress,
                    invoiceNumber,
                  };
                });
              }}
            >
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
            <TextField
              label="Rental Period Start"
              type="date"
              value={form.rentalPeriodStart}
              onChange={(e) => handleRentalStartChange(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: form.billingFrequency === 'quarterly' ? currentQuarter.start : undefined,
                max: form.billingFrequency === 'quarterly' ? currentQuarter.end : undefined,
              }}
            />
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
             <BankLine label="Account Name" value={bankDetails?.accountHolderName || 'Not available'} />
             <BankLine label="Bank" value={bankDetails?.bankName || 'Not available'} />
             <BankLine label="Sort Code" value={bankDetails?.sortCode || 'Not available'} />
           </Grid>
           <Grid item xs={12} md={6}>
             <BankLine label="Account Number" value={bankDetails?.accountNumber || 'Not available'} />
             <BankLine label="Bank Address" value={bankDetails?.bankAddress || 'Not available'} />
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
