import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
} from '@mui/material';
import {
  Business,
  CalendarToday,
  Person,
  Visibility,
  ArrowBack,
  Unarchive,
} from '@mui/icons-material';
import { Company } from '../types';
import { companiesService } from '../services/companies.service';
import { formatDate } from '../utils/helpers';
import { showSuccess, showError } from '../utils/snackbar';

export const ArchivedCompaniesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getArchivedCompanies();
      console.log(data,"Data")
      setCompanies(data);
    } catch (error) {
      showError('Failed to load archived companies');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    if (window.confirm('Are you sure you want to restore this company?')) {
      try {
        await companiesService.restoreCompany(id);
        showSuccess('Company restored successfully');
        loadCompanies();
      } catch (error) {
        showError('Failed to restore company');
      }
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/companies')}>
            Back to Companies
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
              Archived Companies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage your archived company records
            </Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 3, overflowX: 'auto' }}>
        <Table sx={{ minWidth: { xs: 600, md: 800 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>
                {isMobile ? 'Company' : 'Company Name'}
              </TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Company Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Incorporation Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Nature of Business</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Directors</TableCell>
                </>
              )}
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading archived companies...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No archived companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {company.name}
                        </Typography>
                        {isMobile && (
                          <Typography variant="caption" color="text.secondary">
                            #{company.companyNumber}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>
                        <Chip
                          label={company.companyNumber}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          {formatDate(company.incorporationDate)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {company.natureOfBusiness}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          {company.directors}
                        </Box>
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/companies/${company.id}`)}
                        color="info"
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRestore(company.id!)}
                        color="success"
                        title="Restore"
                      >
                        <Unarchive />
                      </IconButton>
                    </Box>
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