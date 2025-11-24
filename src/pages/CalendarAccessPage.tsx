import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Calendar,
  Lock,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CalendarAccessPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate('/property-management')}
          sx={{ mb: 3 }}
        >
          Back to Property Management
        </Button>

        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: 3,
                }}
              >
                <Lock size={40} color="white" />
              </Box>

              <Typography
                variant="h3"
                component="h1"
                fontWeight={700}
                color="primary.main"
                gutterBottom
              >
                Calendar Access Restricted
              </Typography>

              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                Your Calendar Free Trial Version Has Ended
              </Typography>

              <Alert
                severity="warning"
                sx={{
                  mb: 4,
                  fontSize: '1.1rem',
                  '& .MuiAlert-message': {
                    fontWeight: 500,
                  },
                }}
              >
                Contact your administrator to upgrade your plan and regain full access to the calendar module.
              </Alert>
            </Box>

            <Box
              sx={{
                mb: 4,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Calendar size={30} color="white" />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Premium Features
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access advanced calendar features including event scheduling, reminders, and team collaboration.
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Mail size={30} color="white" />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Contact Admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reach out to your system administrator for plan upgrades and access restoration.
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'info.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Phone size={30} color="white" />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Support Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Our support team is ready to assist you with any questions about your account and features.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Need immediate assistance? Contact your administrator or support team.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                Return to Dashboard
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CalendarAccessPage;
