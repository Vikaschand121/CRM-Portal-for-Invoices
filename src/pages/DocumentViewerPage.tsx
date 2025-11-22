import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { ArrowBack, OpenInNew } from '@mui/icons-material';
import { Document } from '../types';
import { documentsService } from '../services/documents.service';

export const DocumentViewerPage = () => {
  const { companyId, propertyId, documentId } = useParams<{ companyId: string; propertyId: string; documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDocument = async () => {
      if (!propertyId || !documentId) {
        setError('Missing document context');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const doc = await documentsService.getDocument(parseInt(propertyId, 10), parseInt(documentId, 10));
        if (cancelled) return;
        setDocument(doc);
        setFiles(doc.fileUrl ? [doc.fileUrl] : []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load document');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDocument();
    return () => {
      cancelled = true;
    };
  }, [propertyId, documentId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !document) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Document not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}`)}>
          Back to Property
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(`/companies/${companyId}/properties/${propertyId}`)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {document.documentName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Type: {document.documentType} | Uploaded: {new Date(document.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Document File
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 3,
            }}
          >
            {files.map((fileUrl, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    height: 320,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50',
                  }}
                >
                  <iframe
                    title={`Document ${index + 1}`}
                    src={fileUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </Box>
                <Button variant="outlined" endIcon={<OpenInNew />} onClick={() => window.open(fileUrl, '_blank')}>
                  Open in new tab
                </Button>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default DocumentViewerPage;
