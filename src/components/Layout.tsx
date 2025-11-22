import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem, Divider, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon, User, LogOut, Sun, Moon, Bell, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../theme/ThemeProvider';
import { SideNav } from './SideNav';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SideNav open={mobileOpen} onClose={handleDrawerToggle} />

      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: { xs: 1, sm: 2 }, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Positive Bespoke Business Solutions Limited
          </Typography>

          {/* Search - Hidden on mobile */}
          {!isMobile && (
            <IconButton color="inherit" sx={{ mr: 1, display: { xs: 'none', lg: 'inline-flex' } }}>
              <Search size={20} />
            </IconButton>
          )}

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}>
            <Bell size={20} />
          </IconButton>

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: { xs: 1, sm: 2 } }}>
            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>

          {/* User Menu */}
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: 280,
                mt: 1.5,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                  {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user?.first_name || user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {user?.userType || 'User'} Account
              </Typography>
            </Box>

            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, px: 3 }}>
              <User size={18} style={{ marginRight: 12 }} />
              Profile Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 3, color: 'error.main' }}>
              <LogOut size={18} style={{ marginRight: 12 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 7, sm: 8 },
          ml: { lg: '280px' },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};