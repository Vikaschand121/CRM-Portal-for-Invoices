import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
} from '@mui/material';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  DollarSign,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const drawerWidth = 280;

const menuItems = [
  {
    title: 'PBBSL Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },

  {
    title: 'Property Management',
    icon: Building2,
    children: [
      { title: 'Dashboard', path: '/property-management' },
      {
        title: 'Calendar',
         path: '/calendar',
        // path: '/calendar',
      },
      { title: 'Companies', path: '/companies' },
      { title: 'Tasks', path: '/tasks' },
      { title: 'Financial', path: '/financial' },
      { title: 'Invoices', path: '/invoices' },
      { title: 'Templates', path: '/invoices' },
      { title: 'Users', path: '/users' },
    ],
  },
  {
    title: 'Legal',
    icon: Building2,
    children: [
      { title: 'Dashboard', path: '/legal-dashboard' },
      { title: 'Clients', path: '/companies' },
      { title: 'Tasks', path: '/tasks' },
      { title: 'Financial', path: '/financial' },
      { title: 'Invoices', path: '/invoices' },
      { title: 'Templates', path: '/invoices' },
      { title: 'Users', path: '/users' },
    ],
  },
  {
    title: 'Financial',
    icon: Building2,
    children: [
      { title: 'Dashboard', path: '/financial-dashboard' },
      { title: 'Clients', path: '/companies' },
      { title: 'Tasks', path: '/tasks' },
      { title: 'Financial', path: '/financial' },
      { title: 'Invoices', path: '/invoices' },
      { title: 'Templates', path: '/invoices' },
      { title: 'Users', path: '/users' },
    ],
  },
  {
    title: 'Maintainance',
    icon: Building2,
    children: [
      { title: 'Dashboard', path: '/maintenance-dashboard' },
      { title: 'Clients', path: '/companies' },
      { title: 'Tasks', path: '/tasks' },
      { title: 'Financial', path: '/financial' },
      { title: 'Invoices', path: '/invoices' },
      { title: 'Templates', path: '/invoices' },
      { title: 'Users', path: '/users' },
    ],
  },
  {
    title: 'Accounts',
    icon: Building2,
    children: [
      { title: 'Dashboard', path: '/accounts-dashboard' },
      { title: 'Clients', path: '/companies' },
      { title: 'Tasks', path: '/tasks' },
      { title: 'Financial', path: '/financial' },
      { title: 'Invoices', path: '/invoices' },
      { title: 'Templates', path: '/invoices' },
      { title: 'Users', path: '/users' },
    ],
  },

  {
    title: 'Users',
    icon: Users,
    path: '/users'
    // children: [
    //   { title: 'Legal', path: '/legal' },
    //   { title: 'Financial', path: '/financial' },
    //   { title: 'Maintenance', path: '/maintenance' },
    //   { title: 'Accounts', path: '/accounts' },
    // ],
  },

];

interface SideNavProps {
  open: boolean;
  onClose: () => void;
}

export const SideNav = ({ open, onClose }: SideNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Property Management']);

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleExpandClick = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderMenuItem = (item: any, level = 0) => {
    const isExpanded = expandedItems.includes(item.title);
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const IconComponent = item.icon;
    const isChild = level > 0;

    return (
      <Box key={item.title}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => hasChildren ? handleExpandClick(item.title) : handleItemClick(item.path)}
            sx={{
              pl: isChild ? 2 + level : 2,
              pr: isChild ? 1.5 : 2,
              py: isChild ? 1 : 1.5,
              bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              borderRadius: 1,
              mx: isChild ? 0.5 : 1,
              '&:hover': {
                bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'rgba(255,255,255,0.8)',
                minWidth: isChild ? 32 : 40,
              }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />
              ) : IconComponent ? (
                <IconComponent size={20} />
              ) : null}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={isActive ? 700 : 500} sx={{ color: 'white' }}>
                  {item.title}
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child: any) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawer = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <Box sx={{
        p: { xs: 2, sm: 3 },
        pt: { xs: 2, sm: 3 },
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: 'white',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            lineHeight: 1.2
          }}
        >
          Positive Bespoke Business Solutions Limited
        </Typography> */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>

      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: 1,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255,255,255,0.5)',
        },
      }}>
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { xs: '280px', sm: '320px' },
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};
