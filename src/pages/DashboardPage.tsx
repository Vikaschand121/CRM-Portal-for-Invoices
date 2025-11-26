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
  useTheme,
  useMediaQuery,
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

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
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
    { id: 1, action: 'New company registered', time: '2 hours ago', type: 'company' },
    { id: 2, action: 'User account updated', time: '4 hours ago', type: 'user' },
    { id: 3, action: 'Invoice generated', time: '6 hours ago', type: 'invoice' },
    { id: 4, action: 'Task completed', time: '8 hours ago', type: 'task' },
    { id: 5, action: 'New user registered', time: '1 day ago', type: 'user' },
  ];

  const stats = [
 
    {
      title: 'Total Number Of Departments',
      value: '5',
      change: '+0',
      changeType: 'neutral',
      icon: Building2,
      color: '#2e7d32',
      departments: ['Property Management', 'Legal', 'Financial', 'Maintenance', 'Accounts'],
    },
       {
      title: "Today's Tasks Per Company",
      value: '24',
      change: '+5',
      changeType: 'positive',
      icon: CheckSquare,
      color: '#1976d2',
    },
    {
      title: 'Total Income Breakdown Per Department',
      value: '$125,430',
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      color: '#ed6c02',
    },
    {
      title: 'Pending Invoices Per Department',
      value: '15',
      change: '-3',
      changeType: 'negative',
      icon: FileText,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={600}
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            lineHeight: 1.2
          }}
        >
          Welcome back, {user?.first_name || user?.name || user?.email?.split('@')[0]}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Here's what's happening with Positive Bespoke Business Solutions Limited today
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: { xs: 2, sm: 2.5, md: 3 },
        mb: { xs: 2, sm: 3, md: 4 }
      }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.changeType === 'positive' ? TrendingUp : stat.changeType === 'negative' ? TrendingDown : null;
          return (
            <Card
              key={index}
              sx={{
                position: 'relative',
                overflow: 'visible',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: { xs: 1.5, sm: 2 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={isMobile ? 20 : 24} color={stat.color} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stat.departments ? (
                      <IconButton
                        size="small"
                        onClick={(e) => setDepartmentsMenuAnchor(e.currentTarget)}
                        sx={{ p: 0.5 }}
                      >
                        <ChevronDown size={16} />
                      </IconButton>
                    ) : TrendIcon ? (
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
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight={600}
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    lineHeight: 1.2
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Departments Dropdown Menu */}
      <Menu
        anchorEl={departmentsMenuAnchor}
        open={Boolean(departmentsMenuAnchor)}
        onClose={() => setDepartmentsMenuAnchor(null)}
        PaperProps={{
          sx: { width: 200, mt: 1 },
        }}
      >
        {stats.find(stat => stat.departments)?.departments?.map((dept, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              // Navigate to department pages
              const routes = {
                'Property Management': '/property-management',

                'Legal': '/legal-dashboard',
                'Financial': '/financial-dashboard',
                'Maintenance': '/maintenance-dashboard',
                'Accounts': '/accounts-dashboard'
              };
              const route = routes[dept as keyof typeof routes];
              if (route) {
                navigate(route);
              }
              setDepartmentsMenuAnchor(null);
            }}
          >
            <Typography variant="body2">{dept}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Charts Section */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: { xs: 2, sm: 2.5, md: 3 },
        mb: { xs: 2, sm: 3, md: 4 }
      }}>
        {/* Revenue Chart */}
        <Card sx={{
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Revenue Overview
            </Typography>
            <Box sx={{
              height: { xs: 250, sm: 280, md: 300 },
              mt: 2
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    fontSize={isMobile ? 12 : 14}
                  />
                  <YAxis
                    fontSize={isMobile ? 12 : 14}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                    contentStyle={{
                      fontSize: isMobile ? '12px' : '14px',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
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
        <Card sx={{
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              User Distribution
            </Typography>
            <Box sx={{
              height: { xs: 250, sm: 280, md: 300 },
              mt: 2
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 70 : 100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    contentStyle={{
                      fontSize: isMobile ? '12px' : '14px',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Department Tasks Chart and Recent Activity */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: { xs: 2, sm: 2.5, md: 3 },
        mb: { xs: 2, sm: 3, md: 4 }
      }}>
        {/* Department Tasks Bar Chart */}
        <Card sx={{
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Department Task Completion
            </Typography>
            <Box sx={{
              height: { xs: 250, sm: 280, md: 300 },
              mt: 2
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    fontSize={isMobile ? 12 : 14}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? 'end' : 'middle'}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis
                    fontSize={isMobile ? 12 : 14}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: isMobile ? '12px' : '14px',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
                  <Bar dataKey="tasks" fill="#1976d2" name="Total Tasks" />
                  <Bar dataKey="completed" fill="#2e7d32" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card sx={{
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Recent Activity
            </Typography>
            <Box sx={{
              mt: 2,
              maxHeight: { xs: 250, sm: 280, md: 300 },
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
              },
            }}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1.5, sm: 2 },
                    py: { xs: 1.25, sm: 1.5 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <Avatar sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    bgcolor: 'primary.main'
                  }}>
                    {activity.type === 'company' && <Building2 size={isMobile ? 14 : 16} />}
                    {activity.type === 'user' && <Users size={isMobile ? 14 : 16} />}
                    {activity.type === 'invoice' && <FileText size={isMobile ? 14 : 16} />}
                    {activity.type === 'task' && <CheckSquare size={isMobile ? 14 : 16} />}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        lineHeight: 1.3
                      }}
                    >
                      {activity.action}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}
                    >
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
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: { xs: 2, sm: 2.5, md: 3 }
      }}>
        {/* Account Info */}
        <Card sx={{
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Account Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                mb: 2,
                flexWrap: 'wrap'
              }}>
                <Avatar sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  bgcolor: 'primary.main'
                }}>
                  {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{
                      fontSize: { xs: '0.95rem', sm: '1rem' }
                    }}
                  >
                    {user?.first_name || user?.name || 'User'}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      wordBreak: 'break-all'
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    User Type:
                  </Typography>
                  <Chip
                    label={user?.userType || 'N/A'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      height: { xs: 24, sm: 28 }
                    }}
                  />
                </Box>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Member Since:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    {user?.createdAt ? formatDate(user.createdAt) : user?.created_at ? formatDate(user.created_at) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1.5, sm: 2 }
            }}>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  System Health
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{
                      flex: 1,
                      height: { xs: 6, sm: 8 },
                      borderRadius: 4
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    85%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                '& > *': {
                  mb: { xs: 0.5, sm: 0 }
                }
              }}>
                <Chip
                  icon={<AlertTriangle size={isMobile ? 14 : 16} />}
                  label="2 Pending Tasks"
                  color="warning"
                  size="small"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
                <Chip
                  icon={<Calendar size={isMobile ? 14 : 16} />}
                  label="3 Due Today"
                  color="info"
                  size="small"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
