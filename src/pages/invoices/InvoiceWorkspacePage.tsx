import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { Property, Tenant, Invoice, BankDetails } from '../../types';
import { propertiesService } from '../../services/properties.service';
import { tenantsService } from '../../services/tenants.service';
import { invoicesService } from '../../services/invoices.service';
import { useSnackbar } from '../../hooks/useSnackbar';
import { InvoicePreview, DEFAULT_LEASE_REMINDER_TEXT } from '../../components/InvoicePreview';
import { getQuarterRange } from '../../utils/quarter';

type WorkspaceMode = 'create' | 'edit';

type InvoiceType = 'rental' | 'service_charge' | 'maintenance' | 'insurance' | 'other' | 'rents_deposit';
type BillingFrequency = 'monthly' | 'quarterly';

interface InvoiceFormState {
  invoiceNumber: string;
  invoiceType: InvoiceType;
  billingFrequency: BillingFrequency;
  invoiceDate: string;
  crmRentStartDate: string;
  crmRentEndDate: string;
  tenantId: string | null;
  companyId: number | null;
  propertyId: number;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  status: string;
  balanceDue?: string;
  paymentMade?: number;
  notes: string;
  billToName: string;
  billToAddress: string;
  creditNoteAmount: number;
}

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

const addDays = (value: string, days: number) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setUTCDate(date.getUTCDate() + days);
  return iso(date);
};

const periodEnd = (start: string, freq: BillingFrequency) => {
  if (!start) return '';
  if (freq === 'quarterly') {
    return getQuarterRange(start).end;
  }
  const base = new Date(start);
  if (Number.isNaN(base.getTime())) return '';
  const months = BILLING_OPTIONS.find((option) => option.value === freq)?.months ?? 1;
  const end = new Date(base);
  end.setMonth(end.getMonth() + months);
  end.setDate(end.getDate() - 1);
  return iso(end);
};
const getCrmQuarterRange = (start: string) => {
  const parsed = new Date(start);
  if (Number.isNaN(parsed.getTime())) return { start: '', end: '' };

  const year = parsed.getFullYear();
  const mar25 = new Date(year, 2, 25);
  const jun23 = new Date(year, 5, 23);
  const jun24 = new Date(year, 5, 24);
  const sep28 = new Date(year, 8, 28);
  const sep29 = new Date(year, 8, 29);
  const dec24 = new Date(year, 11, 24);
  const dec25 = new Date(year, 11, 25);

  if (parsed >= mar25 && parsed <= jun23) {
    return { start: iso(mar25), end: iso(jun23) };
  }

  if (parsed >= jun24 && parsed <= sep28) {
    return { start: iso(jun24), end: iso(sep28) };
  }

  if (parsed >= sep29 && parsed <= dec24) {
    return { start: iso(sep29), end: iso(dec24) };
  }

  if (parsed >= dec25) {
    return { start: iso(dec25), end: iso(new Date(year + 1, 2, 24)) };
  }

  return { start: iso(new Date(year - 1, 11, 25)), end: iso(new Date(year, 2, 24)) };
};

const computeRentalPeriodRange = (start: string, freq: BillingFrequency) => {
  if (!start) return { start: '', end: '' };
  if (freq === 'quarterly') {
    const quarterRange = getCrmQuarterRange(start);
    return { start, end: quarterRange.end };
  }
  return { start, end: periodEnd(start, freq) };
};

const formatDate = (value?: string) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

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
  const initialRange = computeRentalPeriodRange(today, 'monthly');
  return {
    invoiceNumber: `TEMP-${propertyId}-${Date.now().toString().slice(-4)}`,
    invoiceType: 'rental',
    billingFrequency: 'monthly',
    invoiceDate: today,
    crmRentStartDate: initialRange.start || today,
    crmRentEndDate: addDays(initialRange.end, 1),
    tenantId: tenantId ? tenantId.toString() : null,
    companyId,
    propertyId,
    netAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
    status: 'Draft',
    paymentMade: 0,
    balanceDue: undefined,
    notes: '',
    billToName: '',
    billToAddress: '',
    creditNoteAmount: 0,
  };
};

const parseCurrencyValue = (value?: string | number): number => {
  if (value === undefined || value === null) return 0;
  const normalized = typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value.toString();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveBalanceDue = (params: {
  previousBalance?: string | number;
  totalAmount?: string | number;
  paymentMade?: string | number;
  creditNoteAmount?: string | number;
}): number => {
  const previous = parseCurrencyValue(params.previousBalance);
  const total = parseCurrencyValue(params.totalAmount);
  const payment = parseCurrencyValue(params.paymentMade);
  const creditNote = parseCurrencyValue(params.creditNoteAmount);
  const calculated = previous + total - payment - creditNote;
  return Number.isFinite(calculated) ? calculated : 0;
};

const NOTE_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

const NOTE_CURRENCY_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatNoteCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return NOTE_CURRENCY_FORMATTER.format(0);
  return NOTE_CURRENCY_FORMATTER.format(value);
};

const formatNoteDate = (value?: string): string => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', NOTE_DATE_FORMAT_OPTIONS);
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const buildTenantDerivedPatch = (
  tenant: Tenant,
  currentForm: InvoiceFormState,
  invoicesList: Invoice[],
  propertyAddress?: string
): Partial<InvoiceFormState> => {
  const frequencyKey = tenant.rentPaymentFrequency?.toLowerCase();
  const billingFrequency: BillingFrequency = frequencyKey === 'quarterly' ? 'quarterly' : 'monthly';
  const baseStart = tenant.crmRentStartDate || tenant.rentStartDate || currentForm.crmRentStartDate || '';
  const periodRange = computeRentalPeriodRange(baseStart, billingFrequency);
  const tenantHasNetValue = tenant.netAmount?.trim() ? true : false;
  const parsedTenantNet = tenantHasNetValue ? parseCurrencyValue(tenant.netAmount) : currentForm.netAmount || 0;
  const safeNetAmount = Number.isFinite(parsedTenantNet) ? parsedTenantNet : currentForm.netAmount || 0;
  const vatRate = tenant.isVatRegistered ? 0.2 : 0;
  const vatAmount = Number((safeNetAmount * vatRate).toFixed(2));
  const totalAmount = Number((safeNetAmount + vatAmount).toFixed(2));
  const normalizedAddress = propertyAddress?.trim();
  const invoiceNumber = normalizedAddress
    ? generateInvoiceNumber(normalizedAddress, tenant.tenantName, currentForm.invoiceType, invoicesList)
    : currentForm.invoiceNumber;

  return {
    tenantId: tenant.id.toString(),
    billingFrequency,
    crmRentStartDate: periodRange.start || currentForm.crmRentStartDate,
    crmRentEndDate: addDays(periodRange.end || currentForm.crmRentEndDate, 1),
    netAmount: safeNetAmount,
    vatAmount,
    totalAmount,
    billToName: tenant.tenantName,
    billToAddress: tenant.tenantCorrespondingAddress || normalizedAddress || currentForm.billToAddress,
    invoiceNumber,
  };
};

interface InvoiceWorkspacePageProps {
  mode: WorkspaceMode;
}

export const InvoiceWorkspacePage = ({ mode }: InvoiceWorkspacePageProps) => {
  const { companyId, propertyId, invoiceId } = useParams<{ companyId: string; propertyId: string; invoiceId?: string }>();
  const location = useLocation();
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [displayedRecurring, setDisplayedRecurring] = useState(false);
  const [pendingRecurring, setPendingRecurring] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [savingRecurring, setSavingRecurring] = useState(false);

  const buildFirstInvoiceNote = (tenant: Tenant, formState: InvoiceFormState, invoicesList: Invoice[]): string | null => {
    if (!formState.tenantId || Number(formState.tenantId) !== tenant.id) {
      return null;
    }

    const existingForTenant = invoicesList.some((invoice) => invoice.tenantId === tenant.id);
    if (existingForTenant) {
      return null;
    }

    const startValue = formState.crmRentStartDate;
    const endValue = formState.crmRentEndDate;
    if (!startValue || !endValue) {
      return null;
    }

    const startDate = new Date(startValue);
    const endDate = new Date(endValue);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return null;
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / MS_PER_DAY) + 1;
    const defaultDays = formState.billingFrequency === 'quarterly' ? 90 : 30;
    const rentalDays = diffDays > 0 ? diffDays : defaultDays;

    const annualRentValue = parseCurrencyValue(tenant.aggreedAnnualRent);
    if (!Number.isFinite(annualRentValue) || annualRentValue <= 0) {
      return null;
    }

    const dailyRate = annualRentValue / 365;
    const rentDue = dailyRate * rentalDays;

    return `${rentalDays} days between ${formatNoteDate(startValue)} to ${formatNoteDate(endValue)}. Rent per day is ${formatNoteCurrency(annualRentValue)}/365 = ${formatNoteCurrency(
      dailyRate
    )}. Rent due for ${rentalDays} days is ${formatNoteCurrency(dailyRate)} * ${rentalDays} = ${formatNoteCurrency(rentDue)}.`;
  };

  const currentTenant = useMemo(
    () => tenants.find((tenant) => tenant.id.toString() === form?.tenantId),
    [tenants, form?.tenantId]
  );

  useEffect(() => {
    if (currentTenant && typeof currentTenant.isRecurring === 'boolean') {
      setIsRecurring(currentTenant.isRecurring);
      setDisplayedRecurring(currentTenant.isRecurring);
    }
  }, [currentTenant]);

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
            invoiceType: target.invoiceType === 'Rent' ? 'rental' : 'other',
            billingFrequency: 'monthly',
            invoiceDate: target.invoiceDate,
            crmRentStartDate: target.crmRentStartDate ?? '',
            crmRentEndDate: addDays(target.crmRentEndDate ?? '', 1),
            tenantId: target.tenantId.toString(),
            companyId: foundProperty.company?.id ?? numericCompanyId,
            propertyId: numericPropertyId,
            netAmount: target.netAmount,
            vatAmount: target.vatAmount,
            totalAmount: target.totalAmount,
            status: 'Draft',
            paymentMade: target.paymentMade,
            balanceDue: target.balanceDue,
            notes: target.notes,
            billToName: target.billToName,
            billToAddress: target.billToAddress,
            creditNoteAmount: target.creditNoteAmount ?? 0,
          });
          if (!(target as any).notes) {
            updateForm({ notes: DEFAULT_LEASE_REMINDER_TEXT });
          }
        } else {
          const tenantIdFromState = location.state?.tenantId;
          const resolvedTenantId =
            tenantIdFromState !== undefined && tenantIdFromState !== null ? Number(tenantIdFromState) : null;
          const validTenantId = resolvedTenantId !== null && !Number.isNaN(resolvedTenantId) ? resolvedTenantId : null;
          const initialForm = buildInitialForm(
            numericPropertyId,
            foundProperty.company?.id ?? numericCompanyId,
            validTenantId
          );
          let formWithTenant = initialForm;
          if (validTenantId) {
            const matchingTenant = tenantList.find((t) => t.id === validTenantId);
            if (matchingTenant) {
              formWithTenant = {
                ...formWithTenant,
                ...buildTenantDerivedPatch(matchingTenant, formWithTenant, invoiceList, foundProperty.propertyAddress),
              };
              const firstInvoiceNotes = buildFirstInvoiceNote(matchingTenant, formWithTenant, invoiceList);
              if (firstInvoiceNotes) {
                formWithTenant = { ...formWithTenant, notes: firstInvoiceNotes };
              }
            }
          }
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

  const handleRecurringToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;
    setPendingRecurring(nextValue);
    setDisplayedRecurring(nextValue);
    setRecurringDialogOpen(true);
  };

  const handleConfirmRecurring = async () => {
    if (!currentTenant) {
      setRecurringDialogOpen(false);
      return;
    }
    setSavingRecurring(true);
    try {
      await tenantsService.setInvoiceRecurring(currentTenant.id, pendingRecurring);
      setIsRecurring(pendingRecurring);
      setDisplayedRecurring(pendingRecurring);
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

  const handleTenantSelect = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id.toString() === tenantId);
    if (!tenant) return;
    setForm((prev) => {
      if (!prev) return prev;
      const patch = buildTenantDerivedPatch(tenant, prev, existingInvoices, property?.propertyAddress);
      const updatedForm = { ...prev, ...patch };
      const firstInvoiceNotes = buildFirstInvoiceNote(tenant, updatedForm, existingInvoices);
      if (firstInvoiceNotes) {
        updatedForm.notes = firstInvoiceNotes;
      }
      return updatedForm;
    });
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
    if (!form || saving || !property) {
      return;
    }

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

      const previousBalanceValue = parseCurrencyValue(currentTenant?.previousBalance);
      const paymentMadeValue = parseCurrencyValue(form.paymentMade);
      const creditNoteAmountValue = parseCurrencyValue(form.creditNoteAmount);
      const totalAmountValue = parseCurrencyValue(form.totalAmount);
      const safeBalance = resolveBalanceDue({
        previousBalance: previousBalanceValue,
        totalAmount: totalAmountValue,
        paymentMade: paymentMadeValue,
        creditNoteAmount: creditNoteAmountValue,
      });

      const resolvedInvoiceType = resolveInvoiceType(form.invoiceType);
      const vatRateValue = form.netAmount ? form.vatAmount / form.netAmount : 0;
      const companyContactDetails =
        property.company?.name && property.company?.registeredAddress
          ? `Company: ${property.company.name}\nAddress: ${property.company.registeredAddress}`
          : '';

      const payload = {
        tenantId: form.tenantId ? Number(form.tenantId) : null,
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
        crmRentStartDate: form.crmRentStartDate || null,
        crmRentEndDate: form.crmRentEndDate || null,
        netAmount: form.netAmount,
        vatAmount: form.vatAmount,
        vatRate: vatRateValue,
        totalAmount: form.totalAmount,
        paymentMade: paymentMadeValue,
        balanceDue: safeBalance.toFixed(2),
        notes: form.notes,
        creditNoteAmount: creditNoteAmountValue,
        bankAccountName: bankDetails?.accountHolderName || '',
        bankName: bankDetails?.bankName || '',
        bankSortCode: bankDetails?.sortCode || '',
        bankAccountNumber: bankDetails?.accountNumber || '',
        bankAddress: bankDetails?.bankAddress || '',
      } as any;

      if (mode === 'edit' && numericInvoiceId) {
        await invoicesService.updateInvoice(numericInvoiceId, payload);
        showSnackbar('Invoice updated successfully', 'success');
        setSubmitted(true);
        setTimeout(() => navigate(`/companies/${companyId}/properties/${propertyId}`), 1000);
      } else {
        await invoicesService.createInvoice(payload);
        showSnackbar('Invoice created successfully', 'success');
        setSubmitted(true);
        setTimeout(() => navigate(`/companies/${companyId}/properties/${propertyId}`), 1000);
      }
    } catch (err) {
      showSnackbar('Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };


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

  const invoiceTitle = INVOICE_TYPES.find((type) => type.value === form.invoiceType)?.label ?? 'Invoice';
  const previousBalanceValue = parseCurrencyValue(currentTenant?.previousBalance);
  const paymentMadeValue = parseCurrencyValue(form.paymentMade);
  const creditNoteAmountValue = parseCurrencyValue(form.creditNoteAmount);
  const totalAmountValue = parseCurrencyValue(form.totalAmount);
  const safeBalanceDue = resolveBalanceDue({
    previousBalance: previousBalanceValue,
    totalAmount: totalAmountValue,
    paymentMade: paymentMadeValue,
    creditNoteAmount: creditNoteAmountValue,
  });
  const isRentalInvoice = form.invoiceType === 'rental';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate(
              currentTenant
                ? `/tenants/${currentTenant.id}`
                : `/companies/${companyId}/properties/${propertyId}`
            )
          }
        >
          Back to Invoice
        </Button>
        {isRentalInvoice && currentTenant ? (
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
        <Button
          variant="contained"
          startIcon={saving || submitted ? <CircularProgress size={20} /> : <Send />}
          disabled={saving || submitted}
          onClick={() => handleSave('Issued')}
        >
          {submitted ? 'Submitted' : saving ? 'Submitting...' : 'Issue Invoice'}
        </Button>
      </Stack>

      <Stack spacing={3}>
        <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
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
                    const tenant = tenants.find((t) => t.id.toString() === prev.tenantId);
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
                value={form.tenantId || ''}
                fullWidth
                required
                onChange={(e) => handleTenantSelect(e.target.value)}
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id.toString()}>
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
              <TextField select label="Billing Frequency" value={form.billingFrequency} fullWidth disabled>
                {BILLING_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="CRM Rent Start Date"
                type="date"
                value={form.crmRentStartDate}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="CRM Rent End Date" type="date" value={form.crmRentEndDate} fullWidth InputLabelProps={{ shrink: true }} disabled />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label={`VAT (${currentTenant?.isVatRegistered ? '20%' : '0%'})`}
                value={form.vatAmount.toFixed(2)}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Payment Made"
                type="number"
                value={form.paymentMade ?? 0}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                onChange={(e) => updateForm({ paymentMade: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Credit Note Amount"
                type="number"
                value={form.creditNoteAmount ?? 0}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                onChange={(e) => updateForm({ creditNoteAmount: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
              />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <TextField
                label="Balance Due (leave blank to auto-calc)"
                type="number"
                value={form.balanceDue ?? ''}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                onChange={(e) => updateForm({ balanceDue: e.target.value })}
              />
            </Grid> */}

          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <InvoicePreview
            invoiceTitle={invoiceTitle}
            invoiceNumber={form.invoiceNumber}
            invoiceDate={form.invoiceDate}
            dueDate={form.invoiceDate}
            terms="Due on Receipt"
            billToName={form.billToName || currentTenant?.tenantName || 'Tenant'}
            billToAddress={form.billToAddress || currentTenant?.tenantCorrespondingAddress || property.propertyAddress}
            propertyAddress={property.propertyAddress}
            propertyName={property.propertyName}
            crmRentStartDate={form.crmRentStartDate}
            crmRentEndDate={form.crmRentEndDate}
            netAmount={form.netAmount}
            vatAmount={form.vatAmount}
            vatRate={currentTenant?.isVatRegistered ? 0.2 : 0}
            totalAmount={form.totalAmount}
            paymentMade={paymentMadeValue}
            previousBalance={previousBalanceValue}
            balanceDue={safeBalanceDue}
            notes={form.notes}
            company={property.company}
            tenant={currentTenant || null}
            bankDetails={bankDetails}
            creditNoteAmount={creditNoteAmountValue}
          />
        </Paper>

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

      </Stack>
    </Container>
  );
};




