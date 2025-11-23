import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  IconButton,
  Button,
} from '@mui/material';
import {
  CheckSquare,
  Building2,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/helpers';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PropertyManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departmentsMenuAnchor, setDepartmentsMenuAnchor] = React.useState<null | HTMLElement>(null);

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45000, expenses: 32000 },
    { month: 'Feb', revenue: 52000, expenses: 35000 },
    { month: 'Mar', revenue: 48000, expenses: 33000 },
    { month: 'Apr', revenue: 61000, expenses: 38000 },
    { month: 'May', revenue: 55000, expenses: 36000 },
    { month: 'Jun', revenue: 67000, expenses: 40000 },
  ];

  const departmentData = [
    { name: 'IT', tasks: 45, completed: 38 },
    { name: 'HR', tasks: 32, completed: 29 },
    { name: 'Finance', tasks: 28, completed: 25 },
    { name: 'Operations', tasks: 52, completed: 47 },
    { name: 'Marketing', tasks: 35, completed: 31 },
  ];

  const userTypeData = [
    { name: 'Clients', value: 65, color: '#1976d2' },
    { name: 'Admins', value: 15, color: '#dc004e' },
    { name: 'Staff', value: 20, color: '#2e7d32' },
  ];

  const recentActivities = [
    { id: 1, action: 'New property registered', time: '2 hours ago', type: 'property' },
    { id: 2, action: 'User account updated', time: '4 hours ago', type: 'user' },
    { id: 3, action: 'Invoice generated', time: '6 hours ago', type: 'invoice' },
    { id: 4, action: 'Task completed', time: '8 hours ago', type: 'task' },
    { id: 5, action: 'New user registered', time: '1 day ago', type: 'user' },
  ];

  const stats = [
    {
      title: "Today's Tasks",
      value: '24',
      change: '+5',
      changeType: 'positive',
      icon: CheckSquare,
      color: '#1976d2',
    },
    {
      title: 'Total Companies',
      value: '156',
      change: '+12',
      changeType: 'positive',
      icon: Building2,
      color: '#2e7d32',
    },
    {
      title: 'Total Income',
      value: '$125,430',
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      color: '#ed6c02',
    },
    {
      title: 'Pending Invoices',
      value: '15',
      change: '-3',
      changeType: 'negative',
      icon: FileText,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="xl">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<ArrowLeft />} onClick={() => navigate('/dashboard')} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>
        </Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Property Management Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
Here's what's happening with Property Management today

        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.changeType === 'positive' ? TrendingUp : stat.changeType === 'negative' ? TrendingDown : null;
          return (
            <Card key={index} sx={{ position: 'relative', overflow: 'visible' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={24} color={stat.color} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {TrendIcon ? (
                      <TrendIcon
                        size={16}
                        color={stat.changeType === 'positive' ? '#2e7d32' : '#d32f2f'}
                      />
                    ) : null}
                    <Typography
                      variant="caption"
                      sx={{
                        color: stat.changeType === 'positive' ? 'success.main' : stat.changeType === 'negative' ? 'error.main' : 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Revenue Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Revenue Overview
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#1976d2"
                    fill="#1976d220"
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#d32f2f"
                    fill="#d32f2f20"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* User Types Pie Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Property Distribution
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Department Tasks Chart and Recent Activity */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Department Tasks Bar Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Property Task Completion
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#1976d2" name="Total Tasks" />
                  <Bar dataKey="completed" fill="#2e7d32" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {activity.type === 'property' && <Building2 size={16} />}
                    {activity.type === 'user' && <Users size={16} />}
                    {activity.type === 'invoice' && <FileText size={16} />}
                    {activity.type === 'task' && <CheckSquare size={16} />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Account Info and Quick Actions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Account Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Account Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">User Type:</Typography>
                  <Chip
                    label={user?.userType || 'N/A'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Member Since:</Typography>
                  <Typography variant="body2">
                    {user?.createdAt ? formatDate(user.createdAt) : user?.created_at ? formatDate(user.created_at) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  System Health
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    85%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<AlertTriangle size={16} />}
                  label="2 Pending Tasks"
                  color="warning"
                  size="small"
                />
                <Chip
                  icon={<Calendar size={16} />}
                  label="3 Due Today"
                  color="info"
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};