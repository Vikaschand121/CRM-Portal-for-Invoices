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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add,
  Edit,
  Delete,
  Business,
  CalendarToday,
  LocationOn,
  Person,
  AccountBalance,
  Visibility,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Company, CreateCompanyPayload, UpdateCompanyPayload } from '../types';
import { companiesService } from '../services/companies.service';
import { formatDate } from '../utils/helpers';
import { showSuccess, showError } from '../utils/snackbar';

const validationSchema = Yup.object({
  name: Yup.string().required('Company name is required'),
  companyNumber: Yup.string().required('Company number is required'),
  incorporationDate: Yup.string().required('Incorporation date is required'),
  sicCode: Yup.string().required('SIC code is required'),
  natureOfBusiness: Yup.string().required('Nature of business is required'),
  registeredAddress: Yup.string().required('Registered address is required'),
  directors: Yup.string().required('Directors information is required'),
  shareholding: Yup.string().required('Shareholding information is required'),
  confirmationStatementDue: Yup.string().required('Confirmation statement due date is required'),
  accountsDue: Yup.string().required('Accounts due date is required'),
  vatNumber: Yup.string().required('VAT number is required'),
});

export const CompaniesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      companyNumber: '',
      incorporationDate: '',
      sicCode: '',
      natureOfBusiness: '',
      registeredAddress: '',
      directors: '',
      shareholding: '',
      confirmationStatementDue: '',
      accountsDue: '',
      vatNumber: '',
    },
    validationSchema,
    onSubmit: async (values: any) => {
      try {
        if (editingCompany) {
          await companiesService.updateCompany(editingCompany.id!, values as UpdateCompanyPayload);
          showSuccess('Company updated successfully');
        } else {
          await companiesService.createCompany(values as CreateCompanyPayload);
          showSuccess('Company created successfully');
        }
        setDialogOpen(false);
        setEditingCompany(null);
        formik.resetForm();
        loadCompanies();
      } catch (error) {
        showError('An error occurred');
      }
    },
  });

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getCompanies();
      setCompanies(data);
    } catch (error) {
      showError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    formik.setValues({
      name: company.name,
      companyNumber: company.companyNumber,
      incorporationDate: company.incorporationDate,
      sicCode: company.sicCode,
      natureOfBusiness: company.natureOfBusiness,
      registeredAddress: company.registeredAddress,
      directors: company.directors,
      shareholding: company.shareholding,
      confirmationStatementDue: company.confirmationStatementDue,
      accountsDue: company.accountsDue,
      vatNumber: company.vatNumber,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companiesService.deleteCompany(id);
        showSuccess('Company deleted successfully');
        loadCompanies();
      } catch (error) {
        showError('Failed to delete company');
      }
    }
  };

  const handleAdd = () => {
    setEditingCompany(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCompany(null);
    formik.resetForm();
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
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
              Companies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your company records and information
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            fullWidth={isMobile}
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Add Company
          </Button>
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
                  Loading companies...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No companies found
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
                        onClick={() => handleEdit(company)}
                        color="primary"
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(company.id!)}
                        color="error"
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Company Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Company Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && typeof formik.errors.name === 'string' ? formik.errors.name : ''}
              />
              <TextField
                fullWidth
                id="companyNumber"
                name="companyNumber"
                label="Company Number"
                value={formik.values.companyNumber}
                onChange={formik.handleChange}
                error={formik.touched.companyNumber && Boolean(formik.errors.companyNumber)}
                helperText={formik.touched.companyNumber && typeof formik.errors.companyNumber === 'string' ? formik.errors.companyNumber : ''}
              />
              <TextField
                fullWidth
                id="incorporationDate"
                name="incorporationDate"
                label="Incorporation Date"
                type="date"
                value={formik.values.incorporationDate}
                onChange={formik.handleChange}
                error={formik.touched.incorporationDate && Boolean(formik.errors.incorporationDate)}
                helperText={formik.touched.incorporationDate && typeof formik.errors.incorporationDate === 'string' ? formik.errors.incorporationDate : ''}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="sicCode"
                name="sicCode"
                label="SIC Code"
                value={formik.values.sicCode}
                onChange={formik.handleChange}
                error={formik.touched.sicCode && Boolean(formik.errors.sicCode)}
                helperText={formik.touched.sicCode && typeof formik.errors.sicCode === 'string' ? formik.errors.sicCode : ''}
              />
              <TextField
                fullWidth
                id="natureOfBusiness"
                name="natureOfBusiness"
                label="Nature of Business"
                multiline
                rows={2}
                value={formik.values.natureOfBusiness}
                onChange={formik.handleChange}
                error={formik.touched.natureOfBusiness && Boolean(formik.errors.natureOfBusiness)}
                helperText={formik.touched.natureOfBusiness && typeof formik.errors.natureOfBusiness === 'string' ? formik.errors.natureOfBusiness : ''}
                sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
              />
              <TextField
                fullWidth
                id="registeredAddress"
                name="registeredAddress"
                label="Registered Address"
                multiline
                rows={2}
                value={formik.values.registeredAddress}
                onChange={formik.handleChange}
                error={formik.touched.registeredAddress && Boolean(formik.errors.registeredAddress)}
                helperText={formik.touched.registeredAddress && typeof formik.errors.registeredAddress === 'string' ? formik.errors.registeredAddress : ''}
                sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}
              />
              <TextField
                fullWidth
                id="directors"
                name="directors"
                label="Directors"
                value={formik.values.directors}
                onChange={formik.handleChange}
                error={formik.touched.directors && Boolean(formik.errors.directors)}
                helperText={formik.touched.directors && typeof formik.errors.directors === 'string' ? formik.errors.directors : ''}
              />
              <TextField
                fullWidth
                id="shareholding"
                name="shareholding"
                label="Shareholding"
                value={formik.values.shareholding}
                onChange={formik.handleChange}
                error={formik.touched.shareholding && Boolean(formik.errors.shareholding)}
                helperText={formik.touched.shareholding && typeof formik.errors.shareholding === 'string' ? formik.errors.shareholding : ''}
              />
              <TextField
                fullWidth
                id="confirmationStatementDue"
                name="confirmationStatementDue"
                label="Confirmation Statement Due"
                type="date"
                value={formik.values.confirmationStatementDue}
                onChange={formik.handleChange}
                error={formik.touched.confirmationStatementDue && Boolean(formik.errors.confirmationStatementDue)}
                helperText={formik.touched.confirmationStatementDue && typeof formik.errors.confirmationStatementDue === 'string' ? formik.errors.confirmationStatementDue : ''}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="accountsDue"
                name="accountsDue"
                label="Accounts Due"
                type="date"
                value={formik.values.accountsDue}
                onChange={formik.handleChange}
                error={formik.touched.accountsDue && Boolean(formik.errors.accountsDue)}
                helperText={formik.touched.accountsDue && typeof formik.errors.accountsDue === 'string' ? formik.errors.accountsDue : ''}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="vatNumber"
                name="vatNumber"
                label="VAT Number"
                value={formik.values.vatNumber}
                onChange={formik.handleChange}
                error={formik.touched.vatNumber && Boolean(formik.errors.vatNumber)}
                helperText={formik.touched.vatNumber && typeof formik.errors.vatNumber === 'string' ? formik.errors.vatNumber : ''}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={formik.isSubmitting}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => formik.handleSubmit()}
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{
              minWidth: 100,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            {editingCompany ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};