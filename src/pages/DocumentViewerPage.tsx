import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Document } from '../types';

const DUMMY_PDF_URL = 'https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-with-images.pdf';

export const DocumentViewerPage = () => {
  const { companyId, propertyId, documentId } = useParams<{ companyId: string; propertyId: string; documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    // Dummy data - in real app, fetch from API
    const dummyDocuments: Document[] = [
      {
        id: 1,
        name: 'Lease Agreement',
        type: 'PDF',
        url: '#',
        propertyId: parseInt(propertyId || '0'),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        name: 'Lease Agreement Addendum 1',
        type: 'PDF',
        url: '#',
        propertyId: parseInt(propertyId || '0'),
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        id: 3,
        name: 'Lease Agreement Addendum 2',
        type: 'PDF',
        url: '#',
        propertyId: parseInt(propertyId || '0'),
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z',
      },
      {
        id: 4,
        name: 'Property Insurance',
        type: 'PDF',
        url: '#',
        propertyId: parseInt(propertyId || '0'),
        createdAt: '2024-02-15T00:00:00.000Z',
        updatedAt: '2024-02-15T00:00:00.000Z',
      },
    ];

    const foundDoc = dummyDocuments.find(d => d.id === parseInt(documentId || '0'));
    if (foundDoc) {
      setDocument(foundDoc);
      // For lease agreement documents, show multiple files
      if (foundDoc.name.includes('Lease Agreement')) {
        setFiles([DUMMY_PDF_URL, DUMMY_PDF_URL, DUMMY_PDF_URL]);
      } else {
        setFiles([DUMMY_PDF_URL]);
      }
    }
  }, [documentId, propertyId]);

  if (!document) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography>Loading document...</Typography>
        </Box>
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
          <Typography variant="h4" component="h1" fontWeight={700}>
            {document.name}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          Type: {document.type} | Uploaded: {new Date(document.createdAt).toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Document Files ({files.length})
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {files.map((fileUrl, index) => (
              <Paper
                key={index}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  File {index + 1}
                </Typography>
                <Box
                  sx={{
                    height: 250,
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
                  <Typography variant="body2" color="text.secondary">
                    Click to view PDF
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default DocumentViewerPage;