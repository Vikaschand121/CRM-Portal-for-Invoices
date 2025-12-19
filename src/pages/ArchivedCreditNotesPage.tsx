import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
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
import { ArrowBack, Unarchive, Visibility } from '@mui/icons-material';
import { CreditNote } from '../types';
import { propertiesService } from '../services/properties.service';
import { showError, showSuccess } from '../utils/snackbar';

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) {
    return GBP_FORMATTER.format(0);
  }
  return GBP_FORMATTER.format(value);
};

export const ArchivedCreditNotesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fromTenant = location.state?.fromTenant;

  const loadCreditNotes = async () => {
    try {
      setLoading(true);
      const data = await propertiesService.getArchivedCreditNotes();
      setCreditNotes(data);
    } catch (error) {
      showError('Failed to load archived credit notes');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (creditNoteId: number) => {
    if (window.confirm('Are you sure you want to restore this credit note?')) {
      try {
        await propertiesService.restoreCreditNote(creditNoteId);
        showSuccess('Credit note restored successfully');
        loadCreditNotes();
      } catch (error) {
        showError('Failed to restore credit note');
      }
    }
  };

  useEffect(() => {
    loadCreditNotes();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading archived credit notes...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/property-management')}>
            Back to Property Management
          </Button>
          {fromTenant && (
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => navigate(`/tenants/${fromTenant}`)}
            >
              Back to Tenant
            </Button>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Archived Credit Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and restore archived credit notes across all tenants
            </Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'error.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice Number</TableCell>
              {!isMobile && (
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Credit Note Date</TableCell>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
              {!isMobile && (
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tenant</TableCell>
              )}
              {!isMobile && (
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {creditNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 3 : 6} align="center">
                  No archived credit notes found
                </TableCell>
              </TableRow>
            ) : (
              creditNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{note.invoiceNumber}</TableCell>
                  {!isMobile && (
                    <TableCell>{new Date(note.creditNoteDate).toLocaleDateString()}</TableCell>
                  )}
                  <TableCell>{formatCurrency(parseFloat(note.creditNoteAmount))}</TableCell>
                  {!isMobile && <TableCell>{note.tenantName || 'N/A'}</TableCell>}
                  {!isMobile && <TableCell>{note.description}</TableCell>}
                  <TableCell>
                    <IconButton onClick={() => navigate(`/credit-notes/${note.id}`)}>
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => handleRestore(note.id)}>
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

export default ArchivedCreditNotesPage;
