import React from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { BankDetails, Company, Tenant } from '../types';

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
});

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return GBP_FORMATTER.format(0);
  }
  return GBP_FORMATTER.format(Number(value));
};

const formatDate = (value?: string) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatAddressLines = (value?: string) => {
  if (!value) return ['N/A'];
  return value.split('\n').filter(Boolean);
};

const InfoLine = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

const SummaryRow = ({ label, value, bold, highlight, negative }: { label: string; value: string; bold?: boolean; highlight?: boolean; negative?: boolean }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1,
      px: 1.5,
      bgcolor: highlight ? '#f6f7fb' : 'transparent',
      borderRadius: highlight ? 1 : 0,
      color: negative ? 'error.main' : 'inherit',
      fontWeight: bold ? 700 : 500,
    }}
  >
    <Typography variant="body2" fontWeight={bold ? 700 : 500}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={bold ? 700 : 600}>
      {value}
    </Typography>
  </Box>
);

export interface InvoicePreviewProps {
  invoiceTitle: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms?: string;
  billToName: string;
  billToAddress: string;
  propertyAddress: string;
  rentalPeriodStart: string;
  rentalPeriodEnd: string;
  netAmount: number;
  vatAmount: number;
  vatRate: number;
  totalAmount: number;
  paymentMade?: number;
  balanceDue?: number;
  previousBalance?: number;
  notes?: string;
  company?: Company | null;
  tenant?: Tenant | null;
  bankDetails?: Partial<BankDetails> | null;
}

export const InvoicePreview = ({
  invoiceTitle,
  invoiceNumber,
  invoiceDate,
  dueDate,
  terms,
  billToName,
  billToAddress,
  propertyAddress,
  rentalPeriodStart,
  rentalPeriodEnd,
  netAmount,
  vatAmount,
  vatRate,
  totalAmount,
  paymentMade = 0,
  balanceDue,
  previousBalance = 0,
  notes,
  company,
  tenant,
  bankDetails,
}: InvoicePreviewProps) => {
  const safeNet = Number.isFinite(netAmount) ? netAmount : 0;
  const safeVat = Number.isFinite(vatAmount) ? vatAmount : safeNet * (vatRate || 0);
  const safeTotal = Number.isFinite(totalAmount) ? totalAmount : safeNet + safeVat;
  const safePreviousBalance = Number.isFinite(previousBalance) ? previousBalance : 0;
  const safePaymentMade = Number.isFinite(paymentMade) ? paymentMade : 0;
  const computedBalance = safePreviousBalance + safeTotal - safePaymentMade;
  const safeBalanceDue = balanceDue !== undefined && balanceDue !== null && !Number.isNaN(Number(balanceDue))
    ? Number(balanceDue)
    : computedBalance;

  const periodLabel = `${formatDate(rentalPeriodStart)} to ${formatDate(rentalPeriodEnd)}`;

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#ffffff',
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        p: { xs: 3, md: 5 },
        minHeight: '1123px',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'flex-start' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
            {invoiceTitle}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
            Invoice# {invoiceNumber || 'N/A'}
          </Typography>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: '#f6f7fb', border: '1px solid #e5e7eb', width: 180 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Balance Due
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#222">
              {formatCurrency(safeBalanceDue)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 220 }}>
          <Typography variant="h6" fontWeight={800}>
            {company?.name || 'Company Name'}
          </Typography>
          {formatAddressLines(company?.registeredAddress || company?.companyNumber || '').map((line, idx) => (
            <Typography key={idx} variant="body2" color="text.secondary">
              {line}
            </Typography>
          ))}
          {company?.companyNumber && (
            <Typography variant="body2" color="text.secondary">
              Company No: {company.companyNumber}
            </Typography>
          )}
          {company?.vatNumber && (
            <Typography variant="body2" color="text.secondary">
              VAT: {company.vatNumber}
            </Typography>
          )}
        </Box>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <GridSection
        left={
          <>
            <InfoLine label="Invoice Date" value={formatDate(invoiceDate)} />
            <InfoLine label="Terms" value={terms || 'Due on Receipt'} />
            <InfoLine label="Due Date" value={formatDate(dueDate)} />
          </>
        }
        right={
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Bill To
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {billToName || tenant?.tenantName || 'Tenant'}
            </Typography>
            {formatAddressLines(billToAddress).map((line, idx) => (
              <Typography key={idx} variant="body2" color="text.secondary">
                {line}
              </Typography>
            ))}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Property Address
            </Typography>
            {formatAddressLines(propertyAddress).map((line, idx) => (
              <Typography key={idx} variant="body2">
                {line}
              </Typography>
            ))}
          </>
        }
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Previous Balance Due - {formatCurrency(safePreviousBalance)}
      </Typography>

      <Box sx={{ border: '1px solid #dfe3eb', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr repeat(4, 1fr)',
            bgcolor: '#f1f3f8',
            py: 1,
            px: 1.5,
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            Rental Period
          </Typography>
          <Typography variant="body2" fontWeight={700} textAlign="right">
            Net
          </Typography>
          <Typography variant="body2" fontWeight={700} textAlign="right">
            VAT %
          </Typography>
          <Typography variant="body2" fontWeight={700} textAlign="right">
            VAT
          </Typography>
          <Typography variant="body2" fontWeight={700} textAlign="right">
            Amount
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr repeat(4, 1fr)',
            py: 1.5,
            px: 1.5,
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">{periodLabel}</Typography>
          <Typography variant="body2" textAlign="right">
            {formatCurrency(safeNet)}
          </Typography>
          <Typography variant="body2" textAlign="right">
            {(vatRate * 100).toFixed(0)}%
          </Typography>
          <Typography variant="body2" textAlign="right">
            {formatCurrency(safeVat)}
          </Typography>
          <Typography variant="body2" textAlign="right" fontWeight={700}>
            {formatCurrency(safeNet + safeVat)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 360, ml: 'auto' }}>
        <SummaryRow label="Sub Total" value={formatCurrency(safeNet)} />
        <SummaryRow label="Total" value={formatCurrency(safeTotal)} bold />
        <SummaryRow label="Payment Made" value={formatCurrency(-safePaymentMade)} negative />
        <SummaryRow label="Balance Due" value={formatCurrency(safeBalanceDue)} bold highlight />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Please make payment to the following account:
        </Typography>
        <GridSection
          left={
            <>
              <InfoLine label="Account Name" value={bankDetails?.accountHolderName || 'N/A'} />
              <InfoLine label="Bank" value={bankDetails?.bankName || 'N/A'} />
              <InfoLine label="Sort Code" value={bankDetails?.sortCode || 'N/A'} />
            </>
          }
          right={
            <>
              <InfoLine label="Account Number" value={bankDetails?.accountNumber || 'N/A'} />
              <InfoLine label="Bank Address" value={bankDetails?.bankAddress || 'N/A'} />
            </>
          }
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
        Lease agreed between {company?.name || 'Company'} and {tenant?.tenantName || 'Tenant'}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
        {notes ||
          'PLEASE NOTE: NO REMINDERS WILL BE SENT. IF PAYMENT IS NOT RECEIVED BY THE STATED DUE DATE, OUR SOLICITORS WILL BE INSTRUCTED TO COLLECT THE AMOUNT OUTSTANDING IN ACCORDANCE WITH THE TERMS OF THE LEASE.'}
      </Typography>
    </Box>
  );
};

const GridSection = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    spacing={{ xs: 2, sm: 4, md: 6 }}
    justifyContent="space-between"
    alignItems="flex-start"
    sx={{ width: '100%' }}
  >
    <Box sx={{ flex: 1, pr: { sm: 2, md: 4 } }}>{left}</Box>
    <Box sx={{ flex: 1, pl: { sm: 2, md: 4 } }}>{right}</Box>
  </Stack>
);
