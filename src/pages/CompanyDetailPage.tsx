import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccountBalance,
  ArrowBack,
  Business,
  CalendarToday,
  Delete,
  Edit,
  HomeWork,
  LocationOn,
  People,
  TrendingUp,
} from '@mui/icons-material';
import { Company, BankDetails, CreateBankDetailsPayload, UpdateBankDetailsPayload } from '../types';
import { companiesService } from '../services/companies.service';
import { propertiesService } from '../services/properties.service';
import { formatDate } from '../utils/helpers';

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const formatCurrency = (value?: number | string | null): string => {
  if (value === undefined || value === null || value === '') {
    return GBP_FORMATTER.format(0);
  }

  if (typeof value === 'number') {
    return GBP_FORMATTER.format(value);
  }

  const trimmed = value.toString().trim();
  if (/^[\u00A3\u0024\u20AC]/.test(trimmed)) {
    return trimmed;
  }

  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    return GBP_FORMATTER.format(numeric);
  }

  return trimmed;
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
      '&:last-of-type': {
        borderBottom: 'none',
      },
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

export const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [bankDetailsDialogOpen, setBankDetailsDialogOpen] = useState(false);
  const [bankDetailsForm, setBankDetailsForm] = useState<CreateBankDetailsPayload>({
    accountHolderName: '',
    bankName: '',
    sortCode: '',
    accountNumber: '',
    bankAddress: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadCompany = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      const data = await companiesService.getCompany(parseInt(id, 10));
      setCompany(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load company details',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBankDetails = async () => {
    if (!id) {
      return;
    }

    try {
      setBankDetailsLoading(true);
      const data = await propertiesService.getBankDetails(parseInt(id, 10));
      setBankDetails(data);
    } catch (error) {
      // Bank details might not exist, so don't show error
      setBankDetails(null);
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const handleOpenBankDetailsDialog = () => {
    if (bankDetails) {
      setBankDetailsForm(bankDetails);
      setBankDetailsDialogOpen(true);
    }
  };

  const handleCloseBankDetailsDialog = () => {
    setBankDetailsDialogOpen(false);
  };

  const handleSaveBankDetails = async () => {
    if (!id) {
      return;
    }

    try {
      // Always use POST for create/update
      await propertiesService.createBankDetails(parseInt(id, 10), bankDetailsForm);
      setSnackbar({
        open: true,
        message: bankDetails ? 'Bank details updated successfully' : 'Bank details created successfully',
        severity: 'success',
      });
      setBankDetailsDialogOpen(false);
      loadBankDetails();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save bank details',
        severity: 'error',
      });
    }
  };

  const handleDeleteBankDetails = async () => {
    if (!id || !bankDetails) {
      return;
    }

    if (window.confirm('Are you sure you want to delete the bank details?')) {
      try {
        await propertiesService.deleteBankDetails(parseInt(id, 10));
        setBankDetails(null);
        setSnackbar({
          open: true,
          message: 'Bank details deleted successfully',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to delete bank details',
          severity: 'error',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!company?.id) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companiesService.deleteCompany(company.id);
        setSnackbar({
          open: true,
          message: 'Company deleted successfully',
          severity: 'success',
        });
        setTimeout(() => navigate('/companies'), 1500);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to delete company',
          severity: 'error',
        });
      }
    }
  };

  useEffect(() => {
    loadCompany();
  }, [id]);

  useEffect(() => {
    if (company) {
      loadBankDetails();
    }
  }, [company]);

  useEffect(() => {
    if (bankDetails) {
      setBankDetailsForm(bankDetails);
    } else {
      setBankDetailsForm({
        accountHolderName: '',
        bankName: '',
        sortCode: '',
        accountNumber: '',
        bankAddress: '',
      });
    }
  }, [bankDetails]);

  const portfolioStats = useMemo(() => {
    if (!company) {
      return {
        totalProperties: null,
        activeProperties: null,
        portfolioValue: null,
      };
    }

    return {
      totalProperties:
        company.totalProperties ??
        (company.properties && company.properties.length > 0
          ? company.properties.length
          : null),
      activeProperties: company.activeProperties ?? null,
      portfolioValue: company.portfolioValue ?? null,
    };
  }, [company]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Loading company details...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Company not found</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/companies')}
            sx={{ mt: 2 }}
          >
            Back to Companies
          </Button>
        </Box>
      </Container>
    );
  }

  const properties = company.properties ?? [];

  const overviewItems = [
    {
      label: 'Company Type',
      value: company.companyType || company.natureOfBusiness || 'N/A',
    },
    {
      label: 'Status',
      value: company.status || 'Active',
    },
    {
      label: 'Company Number',
      value: company.companyNumber,
    },
    {
      label: 'SIC Code',
      value: company.sicCode,
    },
    {
      label: 'Portfolio Value',
      value:
        portfolioStats.portfolioValue !== null
          ? formatCurrency(portfolioStats.portfolioValue)
          : 'N/A',
    },
    {
      label: 'Total Properties',
      value:
        portfolioStats.totalProperties !== null
          ? portfolioStats.totalProperties.toString()
          : 'N/A',
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
                  <Business sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    {company.name}
                  </Typography>
                  <Chip
                    label={company.natureOfBusiness || 'N/A'}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  />
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
                  variant="contained"
                  onClick={() => navigate('/companies')}
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
                  Back to Companies
                </Button>
              </Box>
            </Box>

            {/* View Properties Button */}
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/companies/${company.id}/properties`)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                }}
              >
                View All Properties
              </Button>
            </Box>
          </Box>
        </Box>


        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr',
                md: '1fr 1fr',
                lg: '1fr 1fr'
              },
              gap: { xs: 2, sm: 2.5 },
            }}
          >
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
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
                  Company Overview
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {overviewItems.map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right' }}>
                        {value || 'N/A'}
                      </Typography>
                    </Box>
                  ))}
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
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    <CalendarToday fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                    Key Dates
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'grey.100' } }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Incorporation Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(company.incorporationDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'grey.100' } }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Confirmation Statement Due
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(company.confirmationStatementDue)}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'grey.100' } }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Accounts Due
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(company.accountsDue)}
                    </Typography>
                  </Box>
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
                      bgcolor: 'success.main',
                      color: 'white',
                    }}
                  >
                    <People fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main' }}>
                    Directors & Shareholding
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Directors
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {company.directors || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Shareholding
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {company.shareholding || 'N/A'}
                    </Typography>
                  </Box>
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
                    <LocationOn fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main' }}>
                    Registered Address
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                  Primary Location
                </Typography>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                    {company.registeredAddress}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

        </Box>

        {/* Bank Details Section */}
        <Box sx={{ mt: 3 }}>
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
                    bgcolor: 'info.main',
                    color: 'white',
                  }}
                >
                  <AccountBalance fontSize="small" />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'info.main' }}>
                  Bank Details
                </Typography>
              </Box>

              {/* Create Bank Account Section */}
              <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
                  Create Bank Account
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Account Holder Name"
                    value={bankDetailsForm.accountHolderName}
                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, accountHolderName: e.target.value })}
                    fullWidth
                    size="small"
                    required
                  />
                  <TextField
                    label="Bank Name"
                    value={bankDetailsForm.bankName}
                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankName: e.target.value })}
                    fullWidth
                    size="small"
                    required
                  />
                  <TextField
                    label="Sort Code"
                    value={bankDetailsForm.sortCode}
                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, sortCode: e.target.value })}
                    fullWidth
                    size="small"
                    required
                  />
                  <TextField
                    label="Account Number"
                    value={bankDetailsForm.accountNumber}
                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, accountNumber: e.target.value })}
                    fullWidth
                    size="small"
                    required
                  />
                  <TextField
                    label="Bank Address"
                    value={bankDetailsForm.bankAddress}
                    onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankAddress: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setBankDetailsForm({
                        accountHolderName: '',
                        bankName: '',
                        sortCode: '',
                        accountNumber: '',
                        bankAddress: '',
                      })}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveBankDetails}
                      disabled={!bankDetailsForm.accountHolderName || !bankDetailsForm.bankName || !bankDetailsForm.sortCode || !bankDetailsForm.accountNumber || !bankDetailsForm.bankAddress}
                    >
                      Create Bank Details
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Existing Bank Details Display */}
              {bankDetailsLoading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading bank details...
                </Typography>
              ) : bankDetails ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'success.main' }}>
                      Current Bank Details
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleOpenBankDetailsDialog}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={handleDeleteBankDetails}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Account Holder Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {bankDetails.accountHolderName}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Bank Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {bankDetails.bankName}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Sort Code
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {bankDetails.sortCode}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Account Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {bankDetails.accountNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'success.100' } }}>
                    <Typography variant="body2" color="success.800" fontWeight={600}>
                      Bank Address
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }} fontWeight={600}>
                      {bankDetails.bankAddress}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No existing bank details. Use the form above to create bank details for this company.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Bank Details Dialog */}
      <Dialog open={bankDetailsDialogOpen} onClose={handleCloseBankDetailsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{bankDetails ? 'Edit Bank Details' : 'Add Bank Details'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Account Holder Name"
              value={bankDetailsForm.accountHolderName}
              onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, accountHolderName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Bank Name"
              value={bankDetailsForm.bankName}
              onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Sort Code"
              value={bankDetailsForm.sortCode}
              onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, sortCode: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Account Number"
              value={bankDetailsForm.accountNumber}
              onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, accountNumber: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Bank Address"
              value={bankDetailsForm.bankAddress}
              onChange={(e) => setBankDetailsForm({ ...bankDetailsForm, bankAddress: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBankDetailsDialog}>Cancel</Button>
          <Button onClick={async () => {
            if (!id) return;
            try {
              await propertiesService.updateBankDetails(parseInt(id, 10), bankDetailsForm);
              setSnackbar({
                open: true,
                message: 'Bank details updated successfully',
                severity: 'success',
              });
              setBankDetailsDialogOpen(false);
              loadBankDetails();
            } catch (error) {
              setSnackbar({
                open: true,
                message: 'Failed to update bank details',
                severity: 'error',
              });
            }
          }} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
