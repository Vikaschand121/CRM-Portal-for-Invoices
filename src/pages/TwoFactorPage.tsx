import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Avatar,
  Divider,
  Link,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Mail, CheckCircle } from 'lucide-react';
import companyLogo from '../assets/images/companylogo.jpeg';
import { useAuth } from '../contexts/AuthContext';
import { validateOTP } from '../utils/validation';
import { showSuccess, showError, showInfo } from '../utils/snackbar';

export const TwoFactorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verify2FA } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOTP(code)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!userId) {
      showError('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      await verify2FA({ code, userId });
      showSuccess('Verification successful!');
      navigate('/dashboard');
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Invalid verification code'
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Login', 'Verification', 'Dashboard'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
            alignItems: 'center',
            minHeight: '80vh',
          }}
        >
          {/* Left Side - Progress & Info */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, color: 'white' }}>
            <Box sx={{ mb: 4 }}>
              <Avatar
                src={companyLogo}
                sx={{
                  width: 80,
                  height: 80,
                  mb: 3,
                  mx: { xs: 'auto', md: '0' },
                }}
              />
              <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                Positive Bespoke Business Solutions Limited
              </Typography>
              {/* <Typography variant="h6" component="h2" gutterBottom fontWeight={400}>
                Two-Factor Authentication
              </Typography> */}
            </Box>

            {/* Progress Steps */}
            {/* <Box sx={{ mb: 4 }}>
              <Stepper activeStep={1} orientation="vertical">
                <Step>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': { color: 'white !important' },
                      '& .MuiStepIcon-root': { color: 'white !important' },
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      Login Credentials
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Successfully authenticated
                    </Typography>
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': { color: 'white !important' },
                      '& .MuiStepIcon-root': { color: 'white !important' },
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      Two-Factor Verification
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Enter verification code
                    </Typography>
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7) !important' },
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Access Dashboard
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Complete verification
                    </Typography>
                  </StepLabel>
                </Step>
              </Stepper>
            </Box> */}

            {/* <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Why Two-Factor Authentication?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                We use 2FA to ensure your account remains secure. A verification code has been sent to your registered email address.
              </Typography>
            </Box> */}

            {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Mail size={20} />
                </Avatar>
                <Box>
                  <Typography variant="body1">Check Your Email</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Code sent to your registered email
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Shield size={20} />
                </Avatar>
                <Box>
                  <Typography variant="body1">Secure Verification</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Code expires in 10 minutes
                  </Typography>
                </Box>
              </Box>
            </Box> */}
          </Box>

          {/* Right Side - Verification Form */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={24}
              sx={{
                width: '100%',
                maxWidth: 480,
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Avatar
                    src={companyLogo}
                    sx={{
                      width: 64,
                      height: 64,
                      mb: 2,
                      mx: 'auto',
                    }}
                  />
                  <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                    Enter Verification Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We've sent a 6-digit code to your email address
                  </Typography>
                </Box>


                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Verification Code"
                    value={code}
                    onChange={handleChange}
                    error={!!error}
                    helperText={error || 'Enter the 6-digit code sent to your email'}
                    disabled={loading}
                    sx={{ mb: 3 }}
                    inputProps={{
                      maxLength: 6,
                      style: {
                        textAlign: 'center',
                        fontSize: '2rem',
                        letterSpacing: '0.5rem',
                        fontWeight: 600,
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || code.length !== 6}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Need Help?
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Didn't receive the code?
                  </Typography>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      // Handle resend logic here
                      showInfo('Code resent to your email');
                    }}
                    sx={{ textDecoration: 'none' }}
                  >
                    Resend Code
                  </Link>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  Back to Login
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
