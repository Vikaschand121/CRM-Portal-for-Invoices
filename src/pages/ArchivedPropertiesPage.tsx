import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Business,
  LocationOn,
  MonetizationOn,
  Visibility,
  ArrowBack,
  Unarchive,
} from '@mui/icons-material';
import { Property } from '../types';
import { propertiesService } from '../services/properties.service';
import { companiesService } from '../services/companies.service';
import { Company } from '../types';
import { showSuccess, showError } from '../utils/snackbar';

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

export const ArchivedPropertiesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [company, setCompany] = useState<Company | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompany = async () => {
    if (!id) return;
    try {
      const data = await companiesService.getCompany(parseInt(id, 10));
      setCompany(data);
    } catch (error) {
      showError('Failed to load company');
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertiesService.getArchivedProperties();
      // Filter properties for this company
      const companyProperties = data.filter(p => p.company.id === parseInt(id || '0'));
      setProperties(companyProperties);
    } catch (error) {
      showError('Failed to load archived properties');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (propertyId: number) => {
    if (window.confirm('Are you sure you want to restore this property?')) {
      try {
        await propertiesService.restoreProperty(propertyId);
        showSuccess('Property restored successfully');
        loadProperties();
      } catch (error) {
        showError('Failed to restore property');
      }
    }
  };

  useEffect(() => {
    loadCompany();
    loadProperties();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading archived properties...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(`/companies/${id}/properties`)}>
            Back to Properties
          </Button>
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
              Archived Properties
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage archived properties for {company?.name}
            </Typography>
          </Box>
        </Box>
      </Box>

      {properties.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center">
          No archived properties found
        </Typography>
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
                <IconButton size="small" onClick={() => handleRestore(property.id)}>
                  <Unarchive />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};