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
import { Tenant } from '../types';
import { tenantsService } from '../services/tenants.service';
import { propertiesService } from '../services/properties.service';
import { Property } from '../types';
import { showSuccess, showError } from '../utils/snackbar';

export const ArchivedTenantsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fromProperty = location.state?.fromProperty;
  const fromCompany = location.state?.fromCompany;

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantsService.getArchivedTenants();
      setTenants(data);
    } catch (error) {
      showError('Failed to load archived tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (tenantId: number) => {
    if (window.confirm('Are you sure you want to restore this tenant?')) {
      try {
        await tenantsService.restoreTenant(tenantId);
        showSuccess('Tenant restored successfully');
        loadTenants();
      } catch (error) {
        showError('Failed to restore tenant');
      }
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading archived tenants...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
       
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => {
                if (fromCompany && fromProperty) {
                  navigate(`/companies/${fromCompany}/properties/${fromProperty}`, { state: { tab: 'tenants' } });
                } else {
                  navigate('/companies');
                }
              }}
            >
              Back to Tenants
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
              Archived Tenants
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all archived tenants across all properties
            </Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tenant Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Property</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Company</TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lease Start Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lease End Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rent Review Dates</TableCell>
                </>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 7} align="center">
                  No archived tenants found
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.tenantName}</TableCell>
                  <TableCell>{tenant.property?.propertyName || 'N/A'}</TableCell>
                  <TableCell>{tenant.property?.company?.name || 'N/A'}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>{new Date(tenant.leaseStartDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(tenant.leaseEndDate).toLocaleDateString()}</TableCell>
                      <TableCell>{tenant.rentReviewDates}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <IconButton onClick={() => handleRestore(tenant.id)}>
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