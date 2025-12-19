import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Payment as PaymentIcon,
  Visibility,
  Description,
  OpenInNew,
  Restore,
} from '@mui/icons-material';
import { Document } from '../types';
import { documentsService } from '../services/documents.service';
import { propertiesService } from '../services/properties.service';

export const ArchivedPaymentDocumentsPage = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!paymentId) {
        setError('Payment ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [archivedDocs, payment] = await Promise.all([
          documentsService.getArchivedDocuments(),
          propertiesService.getPayment(parseInt(paymentId)),
        ]);
        // Filter by paymentDetailId
        const paymentDocs = archivedDocs.filter(doc => doc.paymentDetailId === parseInt(paymentId));
        setDocuments(paymentDocs);
        setPaymentInfo(`${payment.invoiceNumber} - ${payment.paymentMethod}`);
      } catch (err) {
        setError('Failed to load archived documents');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [paymentId]);

  const documentGroups = useMemo(() => {
    const groups = documents.reduce((acc, doc) => {
      const key = doc.documentSubType ? `${doc.documentType} - ${doc.documentSubType}` : doc.documentType;
      if (!acc[key]) {
        acc[key] = {
          type: doc.documentType,
          subType: doc.documentSubType || null,
          documents: []
        };
      }
      acc[key].documents.push(doc);
      return acc;
    }, {} as Record<string, { type: string; subType: string | null; documents: Document[] }>);
    return Object.entries(groups).map(([label, data]) => ({ label, ...data }));
  }, [documents]);

  const handleRestoreDocument = async (documentId: number) => {
    if (window.confirm('Are you sure you want to restore this document?')) {
      try {
        await documentsService.restoreDocument(documentId);
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (err) {
        setError('Failed to restore document');
      }
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
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/payments/${paymentId}/documents`)}>
          Back to Documents
        </Button>
      </Container>
    );
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
                <Avatar
                  sx={{
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Description sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                    {paymentInfo} Archived Documents
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {documents.length} archived document{documents.length !== 1 ? 's' : ''}
                  </Typography>
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
                  onClick={() => navigate(`/payments/${paymentId}/documents`)}
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
                  Back to Documents
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {documentGroups.length === 0 ? (
          <Alert severity="info">
            No archived documents found for this payment.
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
              gap: 3,
            }}
          >
            {documentGroups.map((group) => (
              <Card
                key={group.label}
                sx={{
                  borderRadius: 3,
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
                    <Avatar
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
                      <Description fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>
                      {group.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {group.documents.length} archived document{group.documents.length !== 1 ? 's' : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      startIcon={<Visibility />}
                      onClick={() => {
                        if (group.subType) {
                          navigate(`/payments/${paymentId}/documents/archived/subtype/${encodeURIComponent(group.subType)}`);
                        } else {
                          navigate(`/payments/${paymentId}/documents/archived/type/${encodeURIComponent(group.type)}`);
                        }
                      }}
                      variant="outlined"
                      size="small"
                    >
                      View Documents
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ArchivedPaymentDocumentsPage;