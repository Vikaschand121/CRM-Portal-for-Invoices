import { useEffect, useState } from 'react';
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
  Business,
  Visibility,
  Description,
  OpenInNew,
  Archive,
} from '@mui/icons-material';
import { Document } from '../types';
import { documentsService } from '../services/documents.service';
import { propertiesService } from '../services/properties.service';

export const PropertyDocumentTypePage = () => {
  const { companyId, propertyId, documentType } = useParams<{ companyId: string; propertyId: string; documentType: string }>();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!propertyId || !documentType) {
        setError('Missing parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const decodedType = decodeURIComponent(documentType);
        const docs = await documentsService.getDocumentsByProperty(parseInt(propertyId));
        // Filter by type
        const typeDocs = docs.filter(doc => doc.documentType === decodedType);
        const properties = await propertiesService.getProperties();
        const property = properties.find(p => p.id === parseInt(propertyId));
        setDocuments(typeDocs);
        setPropertyName(property.propertyName);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [propertyId, documentType]);

  const handleArchiveDocument = async (documentId: number) => {
    if (window.confirm('Are you sure you want to archive this document?')) {
      try {
        await documentsService.archiveDocument(documentId);
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (err) {
        setError('Failed to archive document');
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
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}/documents`)}>
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
                    {decodeURIComponent(documentType || '')}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {propertyName} • {documents.length} document{documents.length !== 1 ? 's' : ''}
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
                  onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}/documents`)}
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

        {documents.length === 0 ? (
          <Alert severity="info">
            No documents found for this type.
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
            {documents.map((doc) => (
              <Card
                key={doc.id}
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
                        bgcolor: 'secondary.main',
                        color: 'white',
                      }}
                    >
                      <Description fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'secondary.main' }}>
                      {doc.documentName}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                  </Typography>
                  {doc.documentSubType && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Sub-type: {doc.documentSubType}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      startIcon={<OpenInNew />}
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      variant="outlined"
                      size="small"
                    >
                      View Document
                    </Button>
                    <IconButton
                      onClick={() => handleArchiveDocument(doc.id)}
                      sx={{ color: 'warning.main' }}
                      size="small"
                    >
                      <Archive />
                    </IconButton>
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

export default PropertyDocumentTypePage;