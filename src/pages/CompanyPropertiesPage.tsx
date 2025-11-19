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
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  ArrowBack,
  Business,
  Delete,
  Edit,
  HomeWork,
  LocationOn,
  MonetizationOn,
  MoreVert,
  People,
  TrendingUp,
} from '@mui/icons-material';
import { Company, Property, CreatePropertyPayload, UpdatePropertyPayload } from '../types';
import { companiesService } from '../services/companies.service';
import { propertiesService } from '../services/properties.service';
import { useSnackbar } from '../hooks/useSnackbar';

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

const getStatusColor = (status?: string) => {
  if (!status) {
    return 'default';
  }

  const normalized = status.toLowerCase();
  if (normalized.includes('active')) {
    return 'success';
  }
  if (normalized.includes('pending')) {
    return 'warning';
  }
  if (normalized.includes('inactive') || normalized.includes('sold')) {
    return 'default';
  }
  return 'info';
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

export const CompanyPropertiesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [company, setCompany] = useState<Company | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<CreatePropertyPayload>({
    propertyName: '',
    propertyAddress: '',
    description: '',
    propertyType: '',
    propertyValue: 0,
    rentalIncomePerAnnum: 0,
    companyId: parseInt(id || '0'),
  });

  const loadCompany = async () => {
    if (!id) {
      setError('Company id is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await companiesService.getCompany(parseInt(id, 10));
      setCompany(data);
    } catch (err) {
      setError('Failed to load company');
    }
  };

  const loadProperties = async () => {
    if (!id) return;

    try {
      const allProperties = await propertiesService.getProperties();
      const companyProperties = allProperties.filter(p => p.company.id === parseInt(id));
      setProperties(companyProperties);
    } catch (err) {
      setError('Failed to load properties');
    }
  };

  const loadData = async () => {
    await Promise.all([loadCompany(), loadProperties()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAdd = () => {
    setEditingProperty(null);
    setFormData({
      propertyName: '',
      propertyAddress: '',
      description: '',
      propertyType: '',
      propertyValue: 0,
      rentalIncomePerAnnum: 0,
      companyId: parseInt(id || '0'),
    });
    setDialogOpen(true);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      propertyName: property.propertyName,
      propertyAddress: property.propertyAddress,
      description: property.description,
      propertyType: property.propertyType,
      propertyValue: property.propertyValue,
      rentalIncomePerAnnum: property.rentalIncomePerAnnum,
      companyId: property.company.id!,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (propertyId: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertiesService.deleteProperty(propertyId);
        showSnackbar('Property deleted successfully', 'success');
        loadProperties();
      } catch (err) {
        showSnackbar('Failed to delete property', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingProperty) {
        await propertiesService.updateProperty(editingProperty.id, formData);
        showSnackbar('Property updated successfully', 'success');
      } else {
        await propertiesService.createProperty(formData);
        showSnackbar('Property created successfully', 'success');
      }
      setDialogOpen(false);
      loadProperties();
    } catch (err) {
      showSnackbar('Failed to save property', 'error');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const propertyStats = useMemo(() => {
    const totalValue = properties.reduce(
      (sum, property) => sum + Number(property.propertyValue),
      0,
    );
    const totalRentalIncome = properties.reduce(
      (sum, property) => sum + property.rentalIncomePerAnnum,
      0,
    );
    const activeProperties = company?.activeProperties ?? properties.length; // Use company active if available, else total

    return [
      {
        label: 'Total Properties',
        value: properties.length.toString(),
        helper: 'Total Properties',
        icon: HomeWork,
        action: undefined,
      },
      {
        label: 'Portfolio Value',
        value: formatCurrency(totalValue),
        helper: 'Total Portfolio Value',
        icon: AccountBalance,
        action: undefined,
      },
      {
        label: 'Active Properties',
        value: activeProperties.toString(),
        helper: 'Active Properties',
        icon: TrendingUp,
        action: undefined,
      },
    ];
  }, [properties, company]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Loading properties...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/companies')}>
          Back to Companies
        </Button>
      </Container>
    );
  }

  if (!company) {
    return null;
  }

  const summaryCards = propertyStats.map((stat) => ({
    label: stat.label,
    value: stat.value,
    helper: stat.helper,
    icon: stat.icon,
    action: stat.action,
  }));

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
                    {company.name} Properties
                  </Typography>
                  <Chip
                    label={company.natureOfBusiness || 'Property Management'}
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
                  startIcon={<Add />}
                  variant="contained"
                  onClick={handleAdd}
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
                  Add Property
                </Button>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(`/companies/${company.id}`)}
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
                  Back to Company
                </Button>
              </Box>
            </Box>

            {/* Key Metrics in Hero */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(3, 1fr)'
                },
                gap: { xs: 1.5, sm: 2 },
                mt: 2,
              }}
            >
              {summaryCards.map(({ label, value, helper, icon: Icon, action }) => (
                <Box
                  key={label}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {label}
                    </Typography>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    {value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {helper}
                  </Typography>
                  {action && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(action as any).onClick}
                      sx={{
                        mt: 2,
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {(action as any).label}
                    </Button>
                  )}
                  {label === 'Active Properties' && propertyStats[2].value !== '0' && propertyStats[0].value !== '0' && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(parseInt(propertyStats[2].value) / parseInt(propertyStats[0].value)) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#10b981',
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
                        {propertyStats[2].value} of {propertyStats[0].value} active
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>


        {properties.length === 0 ? (
          <Alert severity="info">
            No properties have been linked to this company yet.
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {properties.map((property) => (
              <Card
                key={property.id}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, backgroundColor: 'grey.50', borderRadius: 'inherit', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {property.propertyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {property.propertyType}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 0.5, mt: 0.25, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.propertyAddress}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <MonetizationOn fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight={600}>
                      {formatCurrency(property.propertyValue)}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/companies/${id}/properties/${property.id}`)}
                  >
                    View
                  </Button>
                  <IconButton size="small" onClick={() => handleEdit(property)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(property.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add Property'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Property Name"
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Property Address"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Property Type"
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              fullWidth
            />
            <TextField
              label="Property Value"
              type="number"
              value={formData.propertyValue}
              onChange={(e) => setFormData({ ...formData, propertyValue: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Rental Income Per Annum"
              type="number"
              value={formData.rentalIncomePerAnnum}
              onChange={(e) => setFormData({ ...formData, rentalIncomePerAnnum: Number(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProperty ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyPropertiesPage;
