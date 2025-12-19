import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Avatar,
  Divider,
  Link,
} from '@mui/material';
import { Eye, EyeOff, Mail, Lock, Shield, Smartphone } from 'lucide-react';
import companyLogo from '../assets/images/companylogo.jpeg';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';
import { showInfo, showError } from '../utils/snackbar';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const result = await login(formData);

      if (result.requires2FA) {
        showInfo(result.message || 'Login verification code sent to your email.');
        navigate('/verify-2fa', { state: { userId: result.userId } });
      } else {
        showInfo(result.message || 'Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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
          {/* Left Side - Branding */}
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
              <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
                Positive Bespoke Business Solutions Limited
              </Typography>
              {/* <Typography variant="h5" component="h2" gutterBottom fontWeight={400}>
                Admin Dashboard
              </Typography> */}
            </Box>

            {/* <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Secure & Efficient
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                Manage your properties, companies, and users with our comprehensive admin platform.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Shield size={20} />
                </Avatar>
                <Typography variant="body1">Advanced Security</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Smartphone size={20} />
                </Avatar>
                <Typography variant="body1">Mobile Responsive</Typography>
              </Box>
            </Box> */}
          </Box>

          {/* Right Side - Login Form */}
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
                    Positive Bespoke Business Solutions Limited
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to your account to continue
                  </Typography>
                </Box>


                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={20} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
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
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                {/* <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Secure Login
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Protected by Two-Factor Authentication
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                    <Shield size={16} color="#666" />
                    <Typography variant="caption" color="text.secondary">
                      Enterprise Security
                    </Typography>
                  </Box>
                </Box> */}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
