import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  CloudUpload,
  Archive,
} from '@mui/icons-material';
import { CreditNote, Document, CreateDocumentPayload } from '../types';
import { propertiesService } from '../services/properties.service';
import { documentsService } from '../services/documents.service';
import { formatDate } from '../utils/helpers';
import { useSnackbar } from '../hooks/useSnackbar';

const CREDIT_NOTE_DOCUMENT_TYPES = [
  'Credit notes',
  'Adjustment letters',
  'Refund confirmations',
  'Other',
];

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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-of-type': { borderBottom: 'none' },
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

export const CreditNoteDetailPage = () => {
  const { creditNoteId } = useParams<{ creditNoteId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState<CreateDocumentPayload>({
    documentName: '',
    documentType: CREDIT_NOTE_DOCUMENT_TYPES[0],
    documentSubType: '',
    file: null,
    creditNoteId: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!creditNoteId) {
        setError('Credit Note ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const creditNoteData = await propertiesService.getCreditNote(parseInt(creditNoteId));
        setCreditNote(creditNoteData);
        const documentData = await documentsService.getDocumentsByCreditNote(parseInt(creditNoteId));
        setDocuments(documentData);
      } catch (err) {
        setError('Failed to load credit note details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [creditNoteId]);

  const handleUploadDocument = () => {
    if (!creditNote) return;
    setDocumentForm({
      documentName: '',
      documentType: CREDIT_NOTE_DOCUMENT_TYPES[0],
      documentSubType: '',
      file: null,
      creditNoteId: creditNote.id,
    });
    setDocumentDialogOpen(true);
  };

  const handleViewDocument = (documentId: number) => {
    navigate(`/documents/${documentId}`);
  };

  const handleArchiveDocument = async (documentId: number) => {
    if (window.confirm('Are you sure you want to archive this document?')) {
      try {
        await documentsService.archiveDocument(documentId);
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        showSnackbar('Document archived successfully', 'success');
      } catch (err) {
        showSnackbar('Failed to archive document', 'error');
      }
    }
  };

  const handleSaveDocument = async () => {
    if (!documentForm.documentName.trim()) {
      showSnackbar('Document name is required', 'error');
      return;
    }
    if (!documentForm.documentType.trim()) {
      showSnackbar('Document type is required', 'error');
      return;
    }
    if (!documentForm.file) {
      showSnackbar('Please select a file to upload', 'error');
      return;
    }

    try {
      await documentsService.createDocument(documentForm);
      showSnackbar('Document uploaded successfully', 'success');
      setDocumentDialogOpen(false);
      // Refresh documents
      if (creditNoteId) {
        const documentData = await documentsService.getDocumentsByCreditNote(parseInt(creditNoteId));
        setDocuments(documentData);
      }
    } catch (err) {
      showSnackbar('Failed to upload document', 'error');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
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
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  if (!creditNote) {
    return null;
  }

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
                <Typography
                  variant="h3"
                  component="h1"
                  fontWeight={800}
                  sx={{
                    mb: 0.5,
                    fontSize: { xs: '1.8rem', sm: '2.125rem', md: '3rem' }
                  }}
                >
                  Credit Note Details
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Invoice: {creditNote.invoiceNumber}
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 1,
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'center', md: 'flex-end' },
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/credit-notes/${creditNoteId}/documents`)}
                  sx={{
                    mb: { xs: 0, md: 2 },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: '200px', sm: 'auto' },
                  }}
                >
                  View Documents
                </Button>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate(-1)}
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
                  Back
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
              <Box
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
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Credit Note Amount
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  {formatCurrency(parseFloat(creditNote.creditNoteAmount))}
                </Typography>
              </Box>
              <Box
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
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Tenant
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  {creditNote.tenantName}
                </Typography>
              </Box>
              <Box
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
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Credit Note Date
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  {new Date(creditNote.creditNoteDate).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

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
            <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
              Credit Note Information
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <InfoRow label="Invoice Number" value={creditNote.invoiceNumber} />
              <InfoRow label="Tenant Name" value={creditNote.tenantName} />
              <InfoRow label="Credit Note Date" value={new Date(creditNote.creditNoteDate).toLocaleDateString()} />
              <InfoRow label="Credit Note Amount" value={formatCurrency(parseFloat(creditNote.creditNoteAmount))} />
              <InfoRow label="Description" value={creditNote.description} />
              <InfoRow label="Created At" value={formatDate(creditNote.createdAt)} />
              <InfoRow label="Updated At" value={formatDate(creditNote.updatedAt)} />
            </Box>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Documents</Typography>
            <Button variant="contained" startIcon={<CloudUpload />} onClick={handleUploadDocument}>
              Upload Document
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'error.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Document Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Uploaded Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>{document.documentName}</TableCell>
                    <TableCell>{document.documentType}</TableCell>
                    <TableCell>{new Date(document.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewDocument(document.id)} sx={{ color: 'primary.main' }}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleArchiveDocument(document.id)} sx={{ color: 'warning.main' }}>
                        <Archive />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Document Upload Dialog */}
        <Dialog open={documentDialogOpen} onClose={() => setDocumentDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Upload Document for Credit Note</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Document Name"
                value={documentForm.documentName}
                onChange={(e) => setDocumentForm({ ...documentForm, documentName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                select
                label="Document Type"
                value={documentForm.documentType}
                onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                fullWidth
                required
              >
                {CREDIT_NOTE_DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <input
                type="file"
                onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocumentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDocument} variant="contained">
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CreditNoteDetailPage;