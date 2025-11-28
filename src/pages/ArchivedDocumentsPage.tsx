import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Business,
  Visibility,
  ArrowBack,
  Unarchive,
  Description,
} from '@mui/icons-material';
import { Document } from '../types';
import { documentsService } from '../services/documents.service';
import { showSuccess, showError } from '../utils/snackbar';

export const ArchivedDocumentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fromProperty = location.state?.fromProperty;
  const fromCompany = location.state?.fromCompany;

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsService.getArchivedDocuments();
      setDocuments(data);
    } catch (error) {
      showError('Failed to load archived documents');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (documentId: number) => {
    if (window.confirm('Are you sure you want to restore this document?')) {
      try {
        await documentsService.restoreDocument(documentId);
        showSuccess('Document restored successfully');
        loadDocuments();
      } catch (error) {
        showError('Failed to restore document');
      }
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading archived documents...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/property-management')}>
            Back to Property Management
          </Button>
          {fromProperty && fromCompany && (
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => {
                if (fromCompany && fromProperty) {
                  navigate(`/companies/${fromCompany}/properties/${fromProperty}`, { state: { tab: 'documents' } });
                } else {
                  navigate('/companies');
                }
              }}
            >
              Back to Documents
            </Button>
          )}
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
              Archived Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all archived documents across all properties
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: { xs: 2, sm: 2.5 },
        }}
      >
        {documents.length === 0 ? (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No archived documents found
            </Typography>
          </Box>
        ) : (
          documents.map((doc) => (
            <Card
              key={doc.id}
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
                      bgcolor: 'secondary.main',
                      color: 'white',
                    }}
                  >
                    <Description fontSize="small" />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'secondary.main' }}>
                    {doc.documentName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'secondary.100' } }}>
                    <Typography variant="body2" color="secondary.800" fontWeight={600}>
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {doc.documentType}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'secondary.100' } }}>
                    <Typography variant="body2" color="secondary.800" fontWeight={600}>
                      Property
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {doc.property?.propertyName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.50', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'secondary.100' } }}>
                    <Typography variant="body2" color="secondary.800" fontWeight={600}>
                      Uploaded
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton onClick={() => handleRestore(doc.id)} sx={{ color: 'success.main' }}>
                    <Unarchive />
                  </IconButton>
                  <IconButton onClick={() => navigate(`/companies/${doc.property?.company?.id}/properties/${doc.propertyId}/documents/${doc.id}`)} sx={{ color: 'primary.main' }}>
                    <Visibility />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};